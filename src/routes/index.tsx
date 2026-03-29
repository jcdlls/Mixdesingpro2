import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, Header } from '../components'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6">
      <Header title="Mixdesign Pro 2" subtitle="Componentes corregidos" />
      <Card title="Bienvenido">
        <p className="text-gray-200">Este es un ejemplo de tarjeta.</p>
        <Button variant="primary" className="mt-4">Botón primario</Button>
      </Card>
    </div>
  )
}