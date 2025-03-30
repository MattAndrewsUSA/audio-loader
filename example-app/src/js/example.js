import { AudioLoader } from 'audio-loader';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    AudioLoader.echo({ value: inputValue })
}
