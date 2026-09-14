import { useEffect, useState } from 'react';

const OPTIONS = [
  { value: 0, label: 'Choose your slices' },
  { value: 1, label: 'One' },
  { value: 2, label: 'Two' },
  { value: 3, label: 'Three' },
  { value: 4, label: 'Four' },
  { value: 5, label: 'Five' },
  { value: 6, label: 'Six' },
  { value: 7, label: 'Seven' },
  { value: 8, label: 'Eight' },
];

const SLICE_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7];

function messagesFor(slices: number): { howMany: string; eaten: string } {
  if (slices === 0) {
    return { howMany: 'How many slices do you want?', eaten: '' };
  }
  if (slices === 1) {
    return { howMany: 'More?', eaten: 'You have eaten 1 slice. (Eat some more...)' };
  }
  if (slices <= 3) {
    return { howMany: 'More?', eaten: `You have eaten ${slices} slices. (Keep eating...)` };
  }
  if (slices === 4) {
    return { howMany: 'More?', eaten: `You have eaten ${slices} slices. (You're halfway there...)` };
  }
  if (slices <= 6) {
    return { howMany: 'More?', eaten: `You have eaten ${slices} slices. (Keep eating...)` };
  }
  if (slices === 7) {
    return {
      howMany: 'Go on, have the last one...',
      eaten: `You have eaten ${slices} slices. (Only one more slice to go...)`,
    };
  }
  return { howMany: 'Dude, you ate the whole pizza!', eaten: 'Now order another one...' };
}

export default function PizzaSlices() {
  const [slices, setSlices] = useState(0);
  const [orderVisible, setOrderVisible] = useState(false);

  useEffect(() => {
    if (slices !== 8) {
      setOrderVisible(false);
      return;
    }
    const timer = setTimeout(() => setOrderVisible(true), 550);
    return () => clearTimeout(timer);
  }, [slices]);

  const { howMany, eaten } = messagesFor(slices);

  return (
    <>
      <h1 style={{ marginBottom: '0', fontSize: '1.6rem' }}>Grab a slice!</h1>
      <p style={{ marginTop: '0' }} id="how_many">
        {howMany}
      </p>
      <form id="pizza-form">
        <select
          id="ddl"
          aria-label="dropdown select"
          value={slices}
          onChange={(e) => setSlices(Number(e.target.value))}
        >
          {OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              id={String(option.value)}
              className="select-value"
              disabled={option.value < slices}
            >
              {option.label}
            </option>
          ))}
        </select>
      </form>
      <div className="piechart">
        <div className="common border" />
        <div className="common base" />
        {SLICE_INDEXES.map((index) => (
          <div key={index} className={`common slice slice_${index + 1}_c`}>
            <div
              className={`common slice slice_${index + 1}_w`}
              id={`slice_${index}_w`}
              style={{
                opacity: slices > index ? 1 : 0,
                transition: slices > index ? 'all 0.85s ease-in 0s' : undefined,
              }}
            />
          </div>
        ))}
      </div>
      <div id="eaten">
        {eaten}
        {slices === 8 && (
          <button
            className={`btn-start-over ${orderVisible ? 'btn-show' : 'btn-hide'}`}
            onClick={() => setSlices(0)}
          >
            Order Now
          </button>
        )}
      </div>
    </>
  );
}
