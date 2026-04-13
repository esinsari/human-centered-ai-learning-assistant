import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ProblemListPage from '@/pages/ProblemListPage'
import LearningSessionPage from '@/pages/LearningSessionPage'
import Layout from '@/components/ui/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"                          element={<HomePage />} />
        <Route path="/problems"                  element={<ProblemListPage />} />
        <Route path="/session/:sessionToken"     element={<LearningSessionPage />} />
      </Routes>
    </Layout>
  )
}
