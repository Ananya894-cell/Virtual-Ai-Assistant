import cv2
import mediapipe as mp
import pyautogui
import math
from enum import IntEnum
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from google.protobuf.json_format import MessageToDict
import screen_brightness_control as sbcontrol

pyautogui.FAILSAFE = False
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands


class Gest(IntEnum):
    FIST = 0
    PINKY = 1
    RING = 2
    MID = 4
    LAST3 = 7
    INDEX = 8
    FIRST2 = 12
    LAST4 = 15
    THUMB = 16
    PALM = 31
    V_GEST = 33
    TWO_FINGER_CLOSED = 34
    PINCH_MAJOR = 35
    PINCH_MINOR = 36


class HLabel(IntEnum):
    MINOR = 0
    MAJOR = 1


class HandRecog:
    def __init__(self, hand_label):
        self.finger = 0
        self.ori_gesture = Gest.PALM
        self.prev_gesture = Gest.PALM
        self.frame_count = 0
        self.hand_result = None
        self.hand_label = hand_label

    def update_hand_result(self, hand_result):
        self.hand_result = hand_result

    def get_signed_dist(self, point):
        sign = -1
        if self.hand_result.landmark[point[0]].y < self.hand_result.landmark[point[1]].y:
            sign = 1
        dx = self.hand_result.landmark[point[0]].x - self.hand_result.landmark[point[1]].x
        dy = self.hand_result.landmark[point[0]].y - self.hand_result.landmark[point[1]].y
        dist = math.sqrt(dx * dx + dy * dy)
        return dist * sign

    def get_dist(self, point):
        dx = self.hand_result.landmark[point[0]].x - self.hand_result.landmark[point[1]].x
        dy = self.hand_result.landmark[point[0]].y - self.hand_result.landmark[point[1]].y
        return math.sqrt(dx * dx + dy * dy)

    def get_dz(self, point):
        return abs(self.hand_result.landmark[point[0]].z - self.hand_result.landmark[point[1]].z)

    def set_finger_state(self):
        if self.hand_result is None:
            return
        points = [[8, 5, 0], [12, 9, 0], [16, 13, 0], [20, 17, 0]]
        self.finger = 0
        for point in points:
            dist = self.get_signed_dist(point[:2])
            dist2 = self.get_signed_dist(point[1:])
            try:
                ratio = round(dist / dist2, 1)
            except ZeroDivisionError:
                ratio = round(dist / 0.01, 1)
            self.finger <<= 1
            if ratio > 0.5:
                self.finger |= 1

    def get_gesture(self):
        if self.hand_result is None:
            return Gest.PALM

        current_gesture = Gest.PALM

        if self.finger in [Gest.LAST3, Gest.LAST4] and self.get_dist([8, 4]) < 0.05:
            if self.hand_label == HLabel.MINOR:
                current_gesture = Gest.PINCH_MINOR
            else:
                current_gesture = Gest.PINCH_MAJOR

        elif self.finger == Gest.FIRST2:
            pt = [[8, 12], [5, 9]]
            dist1 = self.get_dist(pt[0])
            dist2 = self.get_dist(pt[1])
            ratio = dist1 / dist2 if dist2 != 0 else float('inf')
            if ratio > 1.7:
                current_gesture = Gest.V_GEST
            else:
                if self.get_dz([8, 12]) < 0.1:
                    current_gesture = Gest.TWO_FINGER_CLOSED
                else:
                    current_gesture = Gest.MID
        else:
            current_gesture = Gest(self.finger) if self.finger in Gest._value2member_map_ else Gest.PALM

        if current_gesture == self.prev_gesture:
            self.frame_count += 1
        else:
            self.frame_count = 0
        self.prev_gesture = current_gesture

        if self.frame_count > 4:
            self.ori_gesture = current_gesture

        return self.ori_gesture


class Controller:
    tx_old = 0
    ty_old = 0
    flag = False
    grabflag = False
    pinchmajorflag = False
    pinchminorflag = False
    pinchstartxcoord = 0
    pinchstartycoord = 0
    pinchdirectionflag = None
    prevpinchlv = 0
    pinchlv = 0
    framecount = 0
    prev_hand = None
    pinch_threshold = 0.3
    gesture_text = ""

    @staticmethod
    def getpinchylv(hand_result):
        return round((Controller.pinchstartycoord - hand_result.landmark[8].y) * 10, 1)

    @staticmethod
    def getpinchxlv(hand_result):
        return round((hand_result.landmark[8].x - Controller.pinchstartxcoord) * 10, 1)

    # ✅ BRIGHTNESS CONTROL WITH SEPARATE TEXT
    @staticmethod
    def changesystembrightness():
        try:
            curr_brightness = sbcontrol.get_brightness(display=0)[0]
            curr = curr_brightness / 100.0
            curr += Controller.pinchlv / 50.0
            curr = max(0.0, min(1.0, curr))
            sbcontrol.fade_brightness(int(100 * curr), start=curr_brightness)

            if Controller.pinchlv > 0:
                Controller.gesture_text = "Brightness Increased"
            elif Controller.pinchlv < 0:
                Controller.gesture_text = "Brightness Decreased"
        except Exception as e:
            print("Brightness control error:", e)

    # ✅ VOLUME CONTROL WITH SEPARATE TEXT
    @staticmethod
    def changesystemvolume():
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = cast(interface, POINTER(IAudioEndpointVolume))
            curr = volume.GetMasterVolumeLevelScalar()
            new_volume = curr + Controller.pinchlv / 50.0
            new_volume = max(0.0, min(1.0, new_volume))
            volume.SetMasterVolumeLevelScalar(new_volume, None)

            if Controller.pinchlv > 0:
                Controller.gesture_text = "Volume Increased"
            elif Controller.pinchlv < 0:
                Controller.gesture_text = "Volume Decreased"
        except Exception as e:
            print("Volume control error:", e)

    # ✅ NEW — SCROLL WITH SEPARATE UP/DOWN TEXT
    @staticmethod
    def scrollVertical():
        pyautogui.scroll(360 if Controller.pinchlv > 0.0 else -360)
        if Controller.pinchlv > 0:
            Controller.gesture_text = "Scroll Up"
        elif Controller.pinchlv < 0:
            Controller.gesture_text = "Scroll Down"

    # ✅ NEW — ZOOM WITH SEPARATE IN/OUT TEXT
    @staticmethod
    def scrollHorizontal():
        pyautogui.keyDown('shift')
        pyautogui.keyDown('ctrl')
        pyautogui.scroll(-360 if Controller.pinchlv > 0.0 else 360)
        pyautogui.keyUp('ctrl')
        pyautogui.keyUp('shift')
        if Controller.pinchlv > 0:
            Controller.gesture_text = "Zoom In"
        elif Controller.pinchlv < 0:
            Controller.gesture_text = "Zoom Out"

    @staticmethod
    def get_position(hand_result):
        pt = 9
        pos = [hand_result.landmark[pt].x, hand_result.landmark[pt].y]
        sx, sy = pyautogui.size()
        x_old, y_old = pyautogui.position()
        x = int(pos[0] * sx)
        y = int(pos[1] * sy)

        if Controller.prev_hand is None:
            Controller.prev_hand = (x, y)

        dx = x - Controller.prev_hand[0]
        dy = y - Controller.prev_hand[1]
        dist_sq = dx * dx + dy * dy
        Controller.prev_hand = (x, y)

        if dist_sq <= 9:
            ratio = 0
        elif dist_sq <= 400:
            ratio = 0.09 * math.sqrt(dist_sq)
        else:
            ratio = 2.5

        nx = x_old + dx * ratio
        ny = y_old + dy * ratio
        return int(nx), int(ny)

    @staticmethod
    def pinch_control_init(hand_result):
        Controller.pinchstartxcoord = hand_result.landmark[8].x
        Controller.pinchstartycoord = hand_result.landmark[8].y
        Controller.pinchlv = 0
        Controller.prevpinchlv = 0
        Controller.framecount = 0

    @staticmethod
    def pinch_control(hand_result, controlHorizontal, controlVertical):
        if Controller.framecount >= 2:
            Controller.framecount = 0
            Controller.pinchlv = Controller.prevpinchlv
            if Controller.pinchdirectionflag:
                controlHorizontal()
            else:
                controlVertical()

        lvx = Controller.getpinchxlv(hand_result)
        lvy = Controller.getpinchylv(hand_result)

        if abs(lvy) > abs(lvx) and abs(lvy) > Controller.pinch_threshold:
            Controller.pinchdirectionflag = False
            if abs(Controller.prevpinchlv - lvy) < Controller.pinch_threshold:
                Controller.framecount += 1
            else:
                Controller.prevpinchlv = lvy
                Controller.framecount = 0
        elif abs(lvx) > Controller.pinch_threshold:
            Controller.pinchdirectionflag = True
            if abs(Controller.prevpinchlv - lvx) < Controller.pinch_threshold:
                Controller.framecount += 1
            else:
                Controller.prevpinchlv = lvx
                Controller.framecount = 0

    @staticmethod
    def handle_controls(gesture, hand_result):
        x = y = None
        if gesture != Gest.PALM:
            x, y = Controller.get_position(hand_result)

        if gesture != Gest.FIST and Controller.grabflag:
            Controller.grabflag = False
            pyautogui.mouseUp(button="left")

        if gesture != Gest.PINCH_MAJOR and Controller.pinchmajorflag:
            Controller.pinchmajorflag = False
        if gesture != Gest.PINCH_MINOR and Controller.pinchminorflag:
            Controller.pinchminorflag = False

        if gesture == Gest.V_GEST:
            Controller.flag = True
            pyautogui.moveTo(x, y, duration=0.03)
            Controller.gesture_text = "Cursor Move"

        elif gesture == Gest.FIST:
            if not Controller.grabflag:
                Controller.grabflag = True
                pyautogui.mouseDown(button="left")
                Controller.gesture_text = "Dragging"
            else:
                curr_x, curr_y = pyautogui.position()
                if abs(x - curr_x) > 2 or abs(y - curr_y) > 2:
                    pyautogui.moveTo(x, y, duration=0.01)

        elif gesture == Gest.MID and Controller.flag:
            pyautogui.click()
            Controller.flag = False
            Controller.gesture_text = "Left Click"
        elif gesture == Gest.INDEX and Controller.flag:
            pyautogui.click(button='right')
            Controller.flag = False
            Controller.gesture_text = "Right Click"
        elif gesture == Gest.TWO_FINGER_CLOSED and Controller.flag:
            pyautogui.doubleClick()
            Controller.flag = False
            Controller.gesture_text = "Double Click"

        elif gesture == Gest.PINCH_MINOR:
            if not Controller.pinchminorflag:
                Controller.pinch_control_init(hand_result)
                Controller.pinchminorflag = True
            Controller.pinch_control(hand_result, Controller.scrollHorizontal, Controller.scrollVertical)

        elif gesture == Gest.PINCH_MAJOR:
            if not Controller.pinchmajorflag:
                Controller.pinch_control_init(hand_result)
                Controller.pinchmajorflag = True
            Controller.pinch_control(hand_result, Controller.changesystembrightness, Controller.changesystemvolume)


class GestureController:
    gc_mode = 0
    cap = None
    CAM_HEIGHT = None
    CAM_WIDTH = None
    hr_major = None
    hr_minor = None
    dom_hand = True

    def __init__(self):
        GestureController.gc_mode = 1
        GestureController.cap = cv2.VideoCapture(0)
        GestureController.CAM_HEIGHT = GestureController.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        GestureController.CAM_WIDTH = GestureController.cap.get(cv2.CAP_PROP_FRAME_WIDTH)

    @staticmethod
    def classify_hands(results):
        left = None
        right = None
        for idx, hand_h in enumerate(results.multi_handedness or []):
            hd = MessageToDict(hand_h)
            label = hd['classification'][0]['label']
            if label == 'Right':
                right = results.multi_hand_landmarks[idx]
            else:
                left = results.multi_hand_landmarks[idx]
        if GestureController.dom_hand:
            GestureController.hr_major = right
            GestureController.hr_minor = left
        else:
            GestureController.hr_major = left
            GestureController.hr_minor = right

    def start(self):
        handmajor = HandRecog(HLabel.MAJOR)
        handminor = HandRecog(HLabel.MINOR)

        with mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
            while GestureController.cap.isOpened() and GestureController.gc_mode:
                success, image = GestureController.cap.read()
                if not success:
                    print("Ignoring empty camera frame.")
                    continue

                image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = hands.process(image)
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                if results.multi_hand_landmarks:
                    GestureController.classify_hands(results)
                    handmajor.update_hand_result(GestureController.hr_major)
                    handminor.update_hand_result(GestureController.hr_minor)
                    handmajor.set_finger_state()
                    handminor.set_finger_state()

                    g = handminor.get_gesture()
                    if g == Gest.PINCH_MINOR:
                        Controller.handle_controls(g, handminor.hand_result)
                    else:
                        g = handmajor.get_gesture()
                        Controller.handle_controls(g, handmajor.hand_result)

                    for hl in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(image, hl, mp_hands.HAND_CONNECTIONS)
                else:
                    Controller.prev_hand = None

                if Controller.gesture_text:
                    cv2.putText(image, f"Gesture: {Controller.gesture_text}", (10, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3, cv2.LINE_AA)

                cv2.imshow('Gesture Controller', image)

                if cv2.waitKey(1) & 0xFF == 13:
                    break

        GestureController.cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    gc = GestureController()
    gc.start()
