import { useState } from 'react';
import './App.css';
import PureCanvas from './components/PureCanvas';
import UsingPhaser from './components/UsingPhaser';

function App() {
  const list = [
    {
      label: 'pure canvas',
      component: PureCanvas,
    },
    {
      label: 'using Phaser',
      component: UsingPhaser,
    },
  ];
  type Item = typeof list[number];
  const [selected, setSelected] = useState<Item>(list[0]);

  function show(item: Item) {
    setSelected(item);
  }

  return (
    <div>
      <ul className="category">
        {list.map((i) => (
          <li
            className={selected.label === i.label ? 'selected' : ''}
            onClick={() => show(i)}
            key={i.label}
          >
            {i.label}
          </li>
        ))}
      </ul>
      {selected && <selected.component />}
    </div>
  );
}

export default App;
