'use client';

import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

interface RoomColors {
  floor: string;
  walls: string;
  ceiling: string;
}

interface Room3DSceneProps {
  dimensions: RoomDimensions;
  colors?: RoomColors;
  sketchfabId?: string;
  productName?: string;
  onClose?: () => void;
}

// مكون الأرضية
function Floor({ width, length, color }: { width: number; length: number; color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

// مكون السقف
function Ceiling({ width, length, height, color }: { width: number; length: number; height: number; color: string }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

// مكون الجدار
function Wall({ 
  position, 
  rotation, 
  width, 
  height, 
  color 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  width: number; 
  height: number; 
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  );
}

// مكون الغرفة الكاملة
function Room({ dimensions, colors }: { dimensions: RoomDimensions; colors: RoomColors }) {
  const { width, length, height } = dimensions;
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const halfHeight = height / 2;

  return (
    <group>
      {/* الأرضية */}
      <Floor width={width} length={length} color={colors.floor} />
      
      {/* السقف */}
      <Ceiling width={width} length={length} height={height} color={colors.ceiling} />
      
      {/* الجدار الأمامي */}
      <Wall 
        position={[0, halfHeight, -halfLength]} 
        rotation={[0, 0, 0]} 
        width={width} 
        height={height} 
        color={colors.walls} 
      />
      
      {/* الجدار الخلفي */}
      <Wall 
        position={[0, halfHeight, halfLength]} 
        rotation={[0, Math.PI, 0]} 
        width={width} 
        height={height} 
        color={colors.walls} 
      />
      
      {/* الجدار الأيسر */}
      <Wall 
        position={[-halfWidth, halfHeight, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        width={length} 
        height={height} 
        color={colors.walls} 
      />
      
      {/* الجدار الأيمن */}
      <Wall 
        position={[halfWidth, halfHeight, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        width={length} 
        height={height} 
        color={colors.walls} 
      />

      {/* إضاءة السقف */}
      <pointLight position={[0, height - 0.5, 0]} intensity={100} color="#fff5e6" castShadow />
      
      {/* مصباح سقف بسيط */}
      <mesh position={[0, height - 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, height - 0.3, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// مكون أثاث بسيط للتوضيح
function SimpleFurniture() {
  return (
    <group>
      {/* سجادة */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.5, 1.8]} />
        <meshStandardMaterial color="#8B4513" roughness={1} />
      </mesh>
    </group>
  );
}

// مكون Sketchfab المضمن
function SketchfabEmbed({ modelId, productName }: { modelId: string; productName?: string }) {
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&preload=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_controls=1&ui_stop=0&ui_inspector=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&transparent=1`;

  return (
    <div className="absolute bottom-4 right-4 w-80 h-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2 z-10">
        <p className="text-white text-sm font-medium truncate">{productName || 'المنتج'}</p>
      </div>
      <iframe
        title="معاينة المنتج"
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
      />
    </div>
  );
}

// المكون الرئيسي
export default function Room3DScene({ 
  dimensions, 
  colors = { floor: '#d4a574', walls: '#f5f5dc', ceiling: '#ffffff' },
  sketchfabId,
  productName,
  onClose 
}: Room3DSceneProps) {
  const [roomColors, setRoomColors] = useState<RoomColors>(colors);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const wallColorOptions = [
    { name: 'بيج', color: '#f5f5dc' },
    { name: 'أبيض', color: '#ffffff' },
    { name: 'رمادي فاتح', color: '#d3d3d3' },
    { name: 'أزرق فاتح', color: '#b0c4de' },
    { name: 'أخضر فاتح', color: '#90ee90' },
    { name: 'وردي فاتح', color: '#ffb6c1' },
    { name: 'كريمي', color: '#fffdd0' },
  ];

  const floorColorOptions = [
    { name: 'خشب فاتح', color: '#d4a574' },
    { name: 'خشب داكن', color: '#654321' },
    { name: 'رمادي', color: '#808080' },
    { name: 'بلاط أبيض', color: '#f0f0f0' },
    { name: 'باركيه', color: '#c19a6b' },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
      {/* Canvas Three.js */}
      <Canvas shadows className="w-full h-full">
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[dimensions.width, dimensions.height, dimensions.length * 1.5]} fov={60} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={Math.max(dimensions.width, dimensions.length) * 3}
            target={[0, dimensions.height / 2, 0]}
          />
          
          {/* الإضاءة */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={0.5} 
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          
          {/* الغرفة */}
          <Room dimensions={dimensions} colors={roomColors} />
          
          {/* أثاث توضيحي */}
          <SimpleFurniture />
          
          {/* البيئة */}
          <Environment preset="apartment" background={false} />
        </Suspense>
      </Canvas>

      {/* معاينة المنتج من Sketchfab */}
      {sketchfabId && (
        <SketchfabEmbed modelId={sketchfabId} productName={productName} />
      )}

      {/* شريط الأدوات العلوي */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* معلومات الغرفة */}
          <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm">
            <span className="opacity-70">الأبعاد:</span>{' '}
            {dimensions.width}م × {dimensions.length}م × {dimensions.height}م
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* زر تغيير الألوان */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl transition-all"
            title="تغيير الألوان"
          >
            🎨
          </button>

          {/* زر ملء الشاشة */}
          <button
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl transition-all"
            title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>

          {/* زر الإغلاق */}
          {onClose && (
            <button
              onClick={onClose}
              className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white p-3 rounded-xl transition-all"
              title="إغلاق"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* لوحة اختيار الألوان */}
      {showColorPicker && (
        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-md rounded-2xl p-4 w-64 space-y-4">
          <h3 className="text-white font-semibold text-sm border-b border-white/20 pb-2">🎨 ألوان الغرفة</h3>
          
          {/* ألوان الجدران */}
          <div>
            <p className="text-white/70 text-xs mb-2">لون الجدران</p>
            <div className="flex flex-wrap gap-2">
              {wallColorOptions.map((opt) => (
                <button
                  key={opt.color}
                  onClick={() => setRoomColors({ ...roomColors, walls: opt.color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${roomColors.walls === opt.color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>

          {/* ألوان الأرضية */}
          <div>
            <p className="text-white/70 text-xs mb-2">لون الأرضية</p>
            <div className="flex flex-wrap gap-2">
              {floorColorOptions.map((opt) => (
                <button
                  key={opt.color}
                  onClick={() => setRoomColors({ ...roomColors, floor: opt.color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${roomColors.floor === opt.color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* تعليمات التحكم */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white/70 text-xs p-3 rounded-xl space-y-1">
        <p>🖱️ <span className="text-white/50">اسحب للتدوير</span></p>
        <p>🔍 <span className="text-white/50">سكرول للتكبير</span></p>
        <p>✋ <span className="text-white/50">كليك يمين للتحريك</span></p>
      </div>
    </div>
  );
}
