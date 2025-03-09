import { Codec, useCodecControl } from './components/Codec/Codec';
import { Keygen } from './components/Keygen/Keygen';
import './App.css'

function App() {
  const [ctrl, handle] = useCodecControl();

  return <div className='main-container'>
    <Keygen onUse={handle}/>
    <Codec ref={ctrl}/>
  </div>
}

export default App
