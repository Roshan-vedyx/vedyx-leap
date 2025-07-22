// /src/pages/UnitLoader.tsx
import { useEffect, useState } from 'react'
import { getUnits } from '@/services/FirebaseService'
import { useNavigate } from 'react-router-dom'

export default function UnitLoader() {
  const [units, setUnits] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getUnits().then(setUnits)
  }, [])

  return (
    <div className="p-4 grid gap-4">
      {units.map((unit) => (
        <button
          key={unit.id}
          onClick={() => navigate(`/unit/${unit.id}`)}
          className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg text-left"
        >
          <h2 className="text-xl font-bold">{unit.title}</h2>
          <p>{unit.description}</p>
        </button>
      ))}
    </div>
  )
}
