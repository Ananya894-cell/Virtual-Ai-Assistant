import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({ image }) {
  const {
    setBackendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage
  } = useContext(userDataContext)

  return (
    <div
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] 
      bg-[#020220] border-2 rounded-2xl overflow-hidden cursor-pointer 
      hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-white
      ${selectedImage === image 
        ? "border-4 border-white shadow-2xl shadow-blue-950" 
        : "border-[#0000ff66]"}`}
      onClick={() => {
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)
      }}
    >
      <img src={image} className="w-full h-full object-cover" alt="assistant" />
    </div>
  )
}

export default Card
