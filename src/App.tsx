import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './presentation/layouts/AppLayout'
import { RoutineLibraryPage } from './presentation/pages/RoutineLibraryPage'
import { CreateRoutinePage } from './presentation/pages/CreateRoutinePage'
import { EditRoutinePage } from './presentation/pages/EditRoutinePage'
import { WorkoutHistoryPage } from './presentation/pages/WorkoutHistoryPage'
import { ProgressPage } from './presentation/pages/ProgressPage'
import { WorkoutSessionPage } from './presentation/pages/WorkoutSessionPage'
import { ExercisePickerPage } from './presentation/pages/ExercisePickerPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/routines" replace />} />
          <Route path="/routines" element={<RoutineLibraryPage />} />
          <Route path="/routines/new" element={<CreateRoutinePage />} />
          <Route path="/routines/:id/edit" element={<EditRoutinePage />} />
          <Route path="/history" element={<WorkoutHistoryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
        <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        <Route path="/session" element={<WorkoutSessionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
