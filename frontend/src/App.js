import React, {useState, useRef, useEffect} from 'react';

const App = () => {
  const [state, setState] = useState({
    mouseDown: false,
    pixelsArray: []
  });
  const [color, setColor] = useState([0, 0, 0, 255]);

  const ws = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onmessage = e => {
      const decodedData = JSON.parse(e.data);

      switch (decodedData.type) {
        case 'CONNECTED':
          setState(prev => ({
            ...prev,
            pixelsArray: [...decodedData.array]
          }));
          break;
        case 'NEW_DATA_CANVAS':
          // console.log(decodedData.array);
          setState(prev => ({
            ...prev,
            pixelsArray: [...decodedData.array]
          }));
          break;
        default:
          console.log('Unknown data type:', decodedData.type);
      }
    };
  }, []);

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    const imageData = context.createImageData(1, 1);
    const d = imageData.data;

    state.pixelsArray.forEach(data => {
      d[0] = data.color[0];
      d[1] = data.color[1];
      d[2] = data.color[2];
      d[3] = data.color[3];

      context.putImageData(imageData, data.x, data.y)
    });
  }, [state.pixelsArray, color]);

  const canvasMouseMoveHandler = event => {
    if (state.mouseDown) {
      const clientX = event.clientX;
      const clientY = event.clientY;
      setState(prevState => {
        return {
          ...prevState,
          pixelsArray: [...prevState.pixelsArray, {
            x: clientX,
            y: clientY,
            color: color
          }]
        };
      });

      const context = canvas.current.getContext('2d');
      const imageData = context.createImageData(1, 1);
      const d = imageData.data;

      d[0] = color[0];
      d[1] = color[1];
      d[2] = color[2];
      d[3] = color[3];

      context.putImageData(imageData, event.clientX, event.clientY);
    }
  };

  const mouseDownHandler = () => {
    setState({...state, mouseDown: true});
  };

  const mouseUpHandler = () => {
    ws.current.send(JSON.stringify({
      type: 'CREATE_CANVAS',
      array: state.pixelsArray
    }));
    // Где-то здесь отправлять массив пикселей на сервер
    setState({...state, mouseDown: false, pixelsArray: []});
  };

  const changeColor = (e) => {
    const currentColor = e.target.name
    if (currentColor === 'red') {
      setColor([255, 0, 0, 255]);
    } else if (currentColor === 'green') {
      setColor([0, 255, 0, 255]);
    } else if (currentColor === 'black') {
      setColor([0, 0, 0, 255]);
    } else if (currentColor === 'blue') {
      setColor([0, 0, 255, 255]);
    }
  };

  return (
    <div style={{display: "flex"}}>
      <canvas
        ref={canvas}
        style={{border: '1px solid black'}}
        width={800}
        height={600}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onMouseMove={canvasMouseMoveHandler}
      />
      <div style={{position: "relative", padding: "30px"}}>
        <p style={{position: "relative", marginTop: "0"}}>current color:
          <span
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
              border: "0",
              top: "0",
              marginLeft: "10px"
          }}
          />
        </p>
        <button
          style={{position: "absolute", width: "20px", height: "20px", background: "black", border: "0", top: "60px"}}
          name="black"
          onClick={changeColor}
        />
        <button
          style={{position: "absolute", width: "20px", height: "20px", background: "green", border: "0", top: "90px"}}
          name="green"
          onClick={changeColor}
        />
        <button
          style={{position: "absolute", width: "20px", height: "20px", background: "blue", border: "0", top: "120px"}}
          name="blue"
          onClick={changeColor}
        />
        <button
          style={{position: "absolute", width: "20px", height: "20px", background: "red", border: "0", top: "150px"}}
          name="red"
          onClick={changeColor}
        />
      </div>
    </div>
  );
};

export default App;