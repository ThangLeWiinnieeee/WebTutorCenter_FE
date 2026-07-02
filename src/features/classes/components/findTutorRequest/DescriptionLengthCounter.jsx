import { useWatch } from 'react-hook-form';

const DescriptionLengthCounter = ({ control }) => {
  const description = useWatch({ control, name: 'description' });
  const len = description != null && description !== '' ? String(description).length : 0;
  return <span>{len}/2000</span>;
};

export default DescriptionLengthCounter;
