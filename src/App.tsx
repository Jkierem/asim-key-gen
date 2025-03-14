import { Codec, useCodecControl } from './components/Codec/Codec';
import { Keygen } from './components/Keygen/Keygen';
import './App.css'
import { Suspense } from 'react';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';

function App() {
  const [ctrl, handle] = useCodecControl();

  return <Suspense fallback={<>Loading...</>}>
      <div className='main-container'>
        <LanguageSelector />
        <Keygen onUse={handle}/>
        <Codec ref={ctrl}/>
      </div>
  </Suspense>

  return 
}

export default App
