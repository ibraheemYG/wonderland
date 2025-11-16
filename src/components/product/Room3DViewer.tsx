'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';

// دالة لإنشاء نماذج 3D محسّنة بناءً على الفئة
function createProductMesh(
  scene: BABYLON.Scene,
  id: string,
  category: string | undefined,
  dimensions: { width: number; height: number; depth: number },
  color?: { r: number; g: number; b: number }
): BABYLON.Mesh {
  let mesh: BABYLON.Mesh;

  const r = color?.r ?? 0.7;
  const g = color?.g ?? 0.6;
  const b = color?.b ?? 0.5;

  if (category === 'living-room') {
    mesh = BABYLON.MeshBuilder.CreateBox(
      id,
      {
        width: dimensions.width,
        height: dimensions.height * 0.7,
        depth: dimensions.depth,
      },
      scene
    );
    const seat = BABYLON.MeshBuilder.CreateBox(
      `${id}-seat`,
      {
        width: dimensions.width,
        height: dimensions.height * 0.3,
        depth: dimensions.depth,
      },
      scene
    );
    seat.parent = mesh;
    seat.position.y = dimensions.height * 0.2;
  } else if (category === 'bedroom') {
    mesh = BABYLON.MeshBuilder.CreateBox(
      id,
      {
        width: dimensions.width,
        height: dimensions.height * 0.2,
        depth: dimensions.depth,
      },
      scene
    );
    const headboard = BABYLON.MeshBuilder.CreateBox(
      `${id}-head`,
      {
        width: dimensions.width,
        height: dimensions.height * 0.8,
        depth: dimensions.depth * 0.1,
      },
      scene
    );
    headboard.parent = mesh;
    headboard.position.z = dimensions.depth / 2 + dimensions.depth * 0.05;
  } else if (category === 'kitchen') {
    mesh = BABYLON.MeshBuilder.CreateBox(
      id,
      {
        width: dimensions.width,
        height: dimensions.height * 0.8,
        depth: dimensions.depth,
      },
      scene
    );
    const counter = BABYLON.MeshBuilder.CreateBox(
      `${id}-counter`,
      {
        width: dimensions.width * 1.05,
        height: dimensions.height * 0.2,
        depth: dimensions.depth * 1.05,
      },
      scene
    );
    counter.parent = mesh;
    counter.position.y = dimensions.height * 0.4;
  } else if (category === 'decor') {
    mesh = BABYLON.MeshBuilder.CreateCylinder(
      id,
      {
        diameter: Math.min(dimensions.width, dimensions.depth),
        height: dimensions.height,
        tessellation: 16,
      },
      scene
    );
  } else {
    mesh = BABYLON.MeshBuilder.CreateBox(id, dimensions, scene);
  }

  const mat = new BABYLON.StandardMaterial(`mat-${id}`, scene);
  mat.diffuseColor = new BABYLON.Color3(r, g, b);
  mat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  mat.specularPower = 32;
  mat.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  mesh.material = mat;

  return mesh;
}

export interface RoomElement {
  id: string;
  type: 'product' | 'door' | 'window';
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  color?: { r: number; g: number; b: number };
  category?: string;
}

interface Room3DViewerProps {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  elements?: RoomElement[];
  onElementSelect?: (elementId: string) => void;
  onElementPositionChange?: (elementId: string, position: { x: number; y: number; z: number }) => void;
}

export default function Room3DViewer({
  roomWidth,
  roomLength,
  roomHeight,
  elements = [],
  onElementSelect,
  onElementPositionChange,
}: Room3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const selectedMeshRef = useRef<BABYLON.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1);

    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      Math.max(roomWidth, roomLength) * 2.5,
      new BABYLON.Vector3(roomWidth / 2, roomHeight / 2, roomLength / 2),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = Math.max(roomWidth, roomLength) * 5;
    camera.inertia = 0.7;
    camera.angularSensibilityX = 1000;
    camera.angularSensibilityY = 1000;

    const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light1.intensity = 1.0;
    light1.diffuse = new BABYLON.Color3(1, 1, 1);

    const light2 = new BABYLON.DirectionalLight('light2', new BABYLON.Vector3(-1, -2, -1), scene);
    light2.intensity = 0.8;
    light2.position = new BABYLON.Vector3(roomWidth * 0.5, roomHeight * 1.5, roomLength * 0.5);

    const pointLight = new BABYLON.PointLight(
      'pointLight',
      new BABYLON.Vector3(roomWidth / 2, roomHeight * 0.9, roomLength / 2),
      scene
    );
    pointLight.intensity = 0.5;
    pointLight.range = Math.max(roomWidth, roomLength) * 3;

    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: roomWidth, height: roomLength }, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.65);
    groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMaterial.specularPower = 16;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    const wallMaterial = new BABYLON.StandardMaterial('wallMat', scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.83);
    wallMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    wallMaterial.alpha = 0.85;

    const backWall = BABYLON.MeshBuilder.CreatePlane('backWall', { width: roomWidth, height: roomHeight }, scene);
    backWall.position = new BABYLON.Vector3(roomWidth / 2, roomHeight / 2, 0);
    backWall.material = wallMaterial;

    const leftWall = BABYLON.MeshBuilder.CreatePlane('leftWall', { width: roomLength, height: roomHeight }, scene);
    leftWall.position = new BABYLON.Vector3(0, roomHeight / 2, roomLength / 2);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.material = wallMaterial;

    const rightWall = BABYLON.MeshBuilder.CreatePlane('rightWall', { width: roomLength, height: roomHeight }, scene);
    rightWall.position = new BABYLON.Vector3(roomWidth, roomHeight / 2, roomLength / 2);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.material = wallMaterial;

    elements.forEach((element) => {
      let mesh: BABYLON.Mesh;

      if (element.type === 'product') {
        mesh = createProductMesh(scene, element.id, element.category, element.dimensions, element.color);
      } else if (element.type === 'door') {
        mesh = BABYLON.MeshBuilder.CreateBox(element.id, element.dimensions, scene);
        const mat = new BABYLON.StandardMaterial(`mat-${element.id}`, scene);
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
        mat.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        mat.specularPower = 16;
        mesh.material = mat;
      } else {
        mesh = BABYLON.MeshBuilder.CreateBox(element.id, element.dimensions, scene);
        const mat = new BABYLON.StandardMaterial(`mat-${element.id}`, scene);
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.8);
        mat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mat.specularPower = 64;
        mat.alpha = 0.7;
        mesh.material = mat;
      }

      mesh.position = new BABYLON.Vector3(
        element.position.x,
        element.position.y + element.dimensions.height / 2,
        element.position.z
      );
    });

    const pointerDown = () => {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      const hit = pickResult?.hit as any;

      if (hit?.name && !['ground', 'backWall', 'leftWall', 'rightWall'].includes(hit.name)) {
        const isNonDraggable = elements.some(
          (el) => (el.type === 'door' || el.type === 'window') && el.id === hit.name
        );
        if (isNonDraggable) return;

        selectedMeshRef.current = hit;
        onElementSelect?.(hit.name);

        const pointerMove = () => {
          if (!selectedMeshRef.current) return;
          const pickMove = scene.pick(scene.pointerX, scene.pointerY);
          const moveHit = pickMove?.hit as any;

          if (moveHit?.name === 'ground' && pickMove?.pickedPoint) {
            const bounds = selectedMeshRef.current.getBoundingInfo().boundingBox.extendSize;
            selectedMeshRef.current.position.x = Math.max(
              bounds.x,
              Math.min(pickMove.pickedPoint.x, roomWidth - bounds.x)
            );
            selectedMeshRef.current.position.z = Math.max(
              bounds.z,
              Math.min(pickMove.pickedPoint.z, roomLength - bounds.z)
            );

            onElementPositionChange?.(selectedMeshRef.current.name, {
              x: selectedMeshRef.current.position.x,
              y: selectedMeshRef.current.position.y,
              z: selectedMeshRef.current.position.z,
            });
          }
        };

        const pointerUp = () => {
          document.removeEventListener('pointermove', pointerMove);
          document.removeEventListener('pointerup', pointerUp);
          selectedMeshRef.current = null;
        };

        document.addEventListener('pointermove', pointerMove);
        document.addEventListener('pointerup', pointerUp);
      }
    };

    canvas.addEventListener('pointerdown', pointerDown);
    setIsLoading(false);

    engine.runRenderLoop(() => scene.render());

    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      engine.dispose();
    };
  }, [roomWidth, roomLength, roomHeight, elements, onElementSelect, onElementPositionChange]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
          <div className="text-white text-lg">جاري تحميل المشهد 3D...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs p-3 rounded max-w-xs">
        <p>• اسحب العناصر لتحريكها</p>
        <p>• استخدم الماوس او اللمس للدوران والتكبير</p>
      </div>
    </div>
  );
}
