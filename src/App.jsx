// src/App.jsx
import { useEffect, useState } from "react";
import mqtt from "mqtt";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect("wss://067c515e798b4a9c940522456a869d45.s1.eu.hivemq.cloud:8884/mqtt", {
      username: "Frank_Gallo",
      password: "Desierto2024v",
      reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
      console.log("Conectado a MQTT");
      setIsConnected(true);

      // Suscribirse a varios tópicos
      mqttClient.subscribe(["test/topic", "nph/iolink/temperature"], (err) => {
        if (!err) {
          console.log("Suscrito a test/topic y nph/iolink/temperature");
        }
      });
    });

    mqttClient.on("message", (topic, payload) => {
      const newMessage = {
        topic,
        message: payload.toString(),
        timestamp: new Date().toLocaleTimeString(),
      };
      console.log(`Mensaje recibido [${topic}]: ${payload.toString()}`);

      setMessages((prev) => [newMessage, ...prev]); // Mostrar el más nuevo arriba
    });

    mqttClient.on("error", (err) => {
      console.error("Error de conexión:", err);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient.connected) {
        mqttClient.end();
      }
    };
  }, []);

  const sendMessage = () => {
    if (client) {
      client.publish("test/topic", "Hola desde React 🚀");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>MQTT React App</h1>
      <h2>Estado: {isConnected ? "Conectado ✅" : "Desconectado ❌"}</h2>

      <button 
        onClick={sendMessage} 
        disabled={!isConnected} 
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Enviar Mensaje a test/topic
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h3>Mensajes recibidos:</h3>
        {messages.length === 0 ? (
          <p>No hay mensajes aún.</p>
        ) : (
          <ul>
            {messages.map((msg, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <strong>{msg.timestamp}</strong> - 
                <strong> [{msg.topic}]</strong> ➔ {msg.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
