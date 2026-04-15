import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import HomePage from './routes/HomePage'
import PlayPage from './routes/PlayPage'
import TunerPage from './routes/TunerPage'
import ChordsPage from './routes/ChordsPage'
import TrainerPage from './routes/TrainerPage'
import NotFoundPage from './routes/NotFoundPage'
import DesignGalleryPage from './routes/DesignGalleryPage'
import MinimalPage from './pages/design/minimal/MinimalPage'
import StudioPage from './pages/design/studio/StudioPage'
import PlayfulPage from './pages/design/playful/PlayfulPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="play/:songId" element={<PlayPage />} />
          <Route path="play" element={<PlayPage />} />
          <Route path="tuner" element={<TunerPage />} />
          <Route path="chords" element={<ChordsPage />} />
          <Route path="trainer" element={<TrainerPage />} />
          <Route path="design" element={<DesignGalleryPage />} />
          <Route path="design/minimal" element={<MinimalPage />} />
          <Route path="design/studio" element={<StudioPage />} />
          <Route path="design/playful" element={<PlayfulPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
