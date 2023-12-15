// ModelSelection.js
import React, { useEffect, useState } from 'react';
import fetchModelsUtility from '../../util/FetchModels';

const ModelSelection = ({ models, setSelectedModel, selectedModel }) => {
  // const [selectedModel, setSelectedModel] = useState('');
  // const [models, setModels] = useState([]);

  /* Fetch the models and update the state variables `models` and `selectedModel`
when the component mounts or when the `models` state variable changes. */
  // useEffect(() => {
  //   (async () => {
  //     textboxRef.current.focus();
  //     const models = await fetchModelsUtility();
  //     setModels(models);
  //     setSelectedModel(models[0]);
  //   })();
  // }, [models]);
  console.log(models);
  return (
    models && (
      <div style={{ display: 'flex' }}>
        <span style={{ margin: '20px 10px' }}>Model: </span>
        <select
          onChange={(e) => setSelectedModel(e.target.value)}
          value={selectedModel}
          style={{ margin: '10px 0', padding: '5px 10px' }}
        >
          {models.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
    )
  );
};

export default ModelSelection;
