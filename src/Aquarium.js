import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { FishModel } from "./FishModel";
import './styles.css';

const lerp = (start, end, t) => start * (1 - t) + end * t;

const Fish = ({ model, position, velocity, depth }) => {
    const ref = useRef();
    const velRef = useRef([...velocity]);
    const rotationRef = useRef(0);
    
    // Armazena o instante da última mudança de direção
    const lastChangeRef = useRef(performance.now());
    // Define intervalos mínimos e máximos para a mudança de direção (em milissegundos)
    const minInterval = 3000;
    const maxInterval = 6000;
    // Cada peixe recebe seu próprio intervalo aleatório
    const changeIntervalRef = useRef(Math.random() * (maxInterval - minInterval) + minInterval);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === '+') {
                velRef.current = velRef.current.map(v => v * 1.1);
            } else if (event.key === '-') {
                velRef.current = velRef.current.map(v => v * 0.9);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useFrame(() => {
        if (!ref.current) return;
    
        const currentTime = performance.now();
        if (currentTime - lastChangeRef.current > changeIntervalRef.current) {
            // Calcula a magnitude da velocidade atual
            const speed = Math.sqrt(
                velRef.current[0] ** 2 +
                velRef.current[1] ** 2 +
                velRef.current[2] ** 2
            );
    
            // Extrai os ângulos atuais
            const currentTheta = Math.atan2(velRef.current[0], velRef.current[2]);
            const currentPhi = Math.acos(velRef.current[1] / speed);
    
            // Define limites para a variação dos ângulos (ex: 22.5° em radianos)
            const maxDeltaTheta = Math.PI / 8;
            const maxDeltaPhi = Math.PI / 32;
    
            // Gera deltas aleatórios dentro do intervalo [-maxDelta, maxDelta]
            const deltaTheta = (Math.random() * 2 - 1) * maxDeltaTheta;
            const deltaPhi = (Math.random() * 2 - 1) * maxDeltaPhi;
    
            // Calcula os novos ângulos com a variação
            const newTheta = currentTheta + deltaTheta;
            const newPhi = currentPhi + deltaPhi;
    
            // Atualiza a velocidade mantendo a mesma magnitude
            velRef.current = [
                speed * Math.sin(newPhi) * Math.cos(newTheta),
                speed * Math.cos(newPhi),
                speed * Math.sin(newPhi) * Math.sin(newTheta)
            ];
    
            lastChangeRef.current = currentTime;
            changeIntervalRef.current = Math.random() * (maxInterval - minInterval) + minInterval;
        }
    
        // Atualização da posição com a velocidade atual e checagem dos limites
        let newPos = [
            ref.current.position.x + velRef.current[0],
            ref.current.position.y + velRef.current[1],
            ref.current.position.z + velRef.current[2],
        ];
    
        if (newPos[0] < -6 || newPos[0] > 6) velRef.current[0] *= -1;
        if (newPos[1] < -4 || newPos[1] > 4) velRef.current[1] *= -1;
        if (newPos[2] < -depth || newPos[2] > 5) velRef.current[2] *= -1;
    
        ref.current.position.set(...newPos);
    
        const targetRotation = Math.atan2(velRef.current[0], velRef.current[2]);
        rotationRef.current = lerp(rotationRef.current, targetRotation, 0.02);
        ref.current.rotation.y = rotationRef.current;
    });
    

    return <FishModel ref={ref} model={model} position={position} velocity={velRef.current} />;
};


const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="clock">
            {time.toLocaleTimeString()}
        </div>
    );
};

const Aquarium = ({ depth = 20 }) => {
    const [muted, setMuted] = useState(true);
    const videoRef = useRef(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
        }
    };

    const fishData = [
        { model: 1, position: [Math.random() * 5, 0, Math.random() * 5], velocity: [-0.011, 0, 0.012] },
        { model: 2, position: [Math.random() * 5, 0, Math.random() * 5], velocity: [-0.010, 0, 0.010] },
        { model: 3, position: [Math.random() * 5, 0, Math.random() * 5], velocity: [0.012, 0, -0.011] },
        { model: 4, position: [Math.random() * 5, 0, Math.random() * 5], velocity: [0.010, 0, -0.011] },
        { model: 5, position: [Math.random() * 5, 0, Math.random() * 5], velocity: [-0.010, 0, 0.012] },
    ];
    
    return (
        <div className="aquarium-container">
            <video ref={videoRef} className="video-background" autoPlay loop muted>
                <source src="./fundo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <button className="mute-button" onClick={toggleMute}>
                {muted ? '🔇' : '🔊'}
            </button>
            <Clock />
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={1.0} />
                <pointLight position={[10, 10, 10]} />
                {fishData.map((fish, i) => (
                    <Fish key={i} {...fish} depth={depth} />
                ))}
            </Canvas>
        </div>
    );
};

export default Aquarium;
