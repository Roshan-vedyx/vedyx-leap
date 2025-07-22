// /src/pages/UnitPlayer.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUnitWithComponents } from '@/services/FirebaseService'
import StoryPlayer from '@/components/StoryPlayer'
import GamePlayer from '@/components/GamePlayer'
import RuleCard from '@/components/RuleCard'
import ScenarioPlayer from '@/components/ScenarioPlayer'

export default function UnitPlayer() {
  const { unitId } = useParams()
  const [components, setComponents] = useState([])
  const [step, setStep] = useState(0)

  useEffect(() => {
    getUnitWithComponents(unitId!).then((data) => {
      setComponents(data.components)
    })
  }, [unitId])

  const current = components[step]

  const renderComponent = () => {
    if (!current) return null
    switch (current.type) {
      case 'story':
        return <StoryPlayer {...current} />
      case 'game':
        return <GamePlayer {...current} />
      case 'ruleCard':
        return <RuleCard {...current} />
      case 'scenario':
        return <ScenarioPlayer {...current} />
      default:
        return <div>Unknown type</div>
    }
  }

  return (
    <div className="p-4">
      {renderComponent()}
      <button
        onClick={() => setStep((s) => s + 1)}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
      >
        Next
      </button>
    </div>
  )
}
