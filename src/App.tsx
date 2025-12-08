import "./App.css";
import HoverImageMagnifier from "./components/HoverImageMagnifier";

function App() {
  return (
    <div className="App">
      <h1>Hover Image Magnifier</h1>
      <HoverImageMagnifier
        styles={{
          img: { margin: "0 auto", display: "block", borderRadius: "8px" },
        }}
        mode="magnifier"
        placement="right"
        src="https://i.pinimg.com/736x/e0/76/ba/e076ba26b86f9d7dd01f3fc8253f6dbc.jpg"
        // src="https://static.vecteezy.com/system/resources/previews/049/855/833/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-free-photo.jpg"
      />
    </div>
  );
}

export default App;
