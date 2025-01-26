import React from "react"
import Chatbot from "../components/Chatbot"
import DecisionTree from "../components/DecisionTree"
import FileUpload from "../components/FileUpload"
import { Canvas } from "@react-three/fiber"
import { Leva } from "leva"
import { Experience } from "../components/Experience"
import { UI } from "../components/UI"

const Home = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <div className="w-1/2">
            <div className="bg-gradient-to-br from-blue-600/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <DecisionTree />
            </div>
          </div>
          <div className="w-1/2">
            <div className="h-[600px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-white/50">
              <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                <Experience />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
      <Leva hidden />
      <UI />
    </div>
  )
}

export default Home

