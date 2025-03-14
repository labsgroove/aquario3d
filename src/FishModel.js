import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { AnimationMixer } from "three";
import { useFrame } from "@react-three/fiber";

export function FishModel({ model, velocity, ...props }) {
    const modelPaths = ["/alngels.glb", "/turtle.glb", "/scenes.glb", "/turtlel.glb", "/alngels1.glb"];
    const { scene, animations } = useGLTF(modelPaths[model - 1]);
    const fishRef = useRef();
    const mixerRef = useRef();
    const actionRef = useRef();

    useEffect(() => {
        if (animations && animations.length > 0) {
            mixerRef.current = new AnimationMixer(scene);
            actionRef.current = mixerRef.current.clipAction(animations[0]);
            actionRef.current.play();
        }

        return () => {
            if (mixerRef.current) {
                mixerRef.current.stopAllAction();
                mixerRef.current = null;
            }
        };
    }, [scene, animations]);

    useFrame((state, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta);
            if (actionRef.current) {
                const speed = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 3 + velocity[2] ** 4);
                actionRef.current.timeScale = speed * 100; // Adjust the multiplier as needed
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <primitive ref={fishRef} object={scene} scale={0.3} {...props} />
        </>
    );
}
