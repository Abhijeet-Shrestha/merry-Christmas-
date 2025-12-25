import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useParallax } from '@/hooks/useParallax';

interface ChristmasSceneProps {
  onSceneReady?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;
  animationProgress: number;
  lightsOn: boolean;
}

export function ChristmasScene({ onSceneReady, animationProgress, lightsOn }: ChristmasSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    tree: THREE.Group;
    lights: THREE.PointLight[];
    star: THREE.Mesh;
    snowParticles: THREE.Points;
    bokehParticles: THREE.Points;
  } | null>(null);
  
  const parallax = useParallax();
  const frameRef = useRef<number>(0);

  // Create tree geometry
  const createTree = useMemo(() => {
    return () => {
      const tree = new THREE.Group();
      
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 12);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.9,
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = -2.5;
      tree.add(trunk);

      // Tree layers (cone shapes for pine tree)
      const layers = [
        { radius: 2.2, height: 2.5, y: -1 },
        { radius: 1.8, height: 2.2, y: 0.5 },
        { radius: 1.4, height: 2, y: 1.8 },
        { radius: 1, height: 1.8, y: 2.9 },
        { radius: 0.6, height: 1.5, y: 3.8 },
      ];

      layers.forEach((layer) => {
        const geometry = new THREE.ConeGeometry(layer.radius, layer.height, 32);
        const material = new THREE.MeshStandardMaterial({
          color: 0x1a472a,
          roughness: 0.8,
          metalness: 0.1,
        });
        const cone = new THREE.Mesh(geometry, material);
        cone.position.y = layer.y;
        
        // Add snow on top of each layer
        const snowGeometry = new THREE.ConeGeometry(layer.radius * 0.95, layer.height * 0.3, 32);
        const snowMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0,
        });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.y = layer.y + layer.height * 0.4;
        snow.scale.set(1, 0.5, 1);
        
        tree.add(cone);
        tree.add(snow);
      });

      return tree;
    };
  }, []);

  // Create ornaments
  const createOrnaments = useMemo(() => {
    return (tree: THREE.Group) => {
      const ornamentColors = [0xff0000, 0xffd700, 0x0066cc, 0xff6600, 0xcc0066];
      const ornaments: THREE.Mesh[] = [];
      
      for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2 * 3;
        const height = -1 + (i / 25) * 4;
        const radius = 1.5 - (height + 1) * 0.25;
        
        const geometry = new THREE.SphereGeometry(0.12, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: ornamentColors[i % ornamentColors.length],
          roughness: 0.2,
          metalness: 0.8,
          emissive: ornamentColors[i % ornamentColors.length],
          emissiveIntensity: 0.2,
        });
        
        const ornament = new THREE.Mesh(geometry, material);
        ornament.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        
        tree.add(ornament);
        ornaments.push(ornament);
      }
      
      return ornaments;
    };
  }, []);

  // Create string lights
  const createStringLights = useMemo(() => {
    return (tree: THREE.Group) => {
      const lights: THREE.PointLight[] = [];
      const lightColors = [0xffcc00, 0xff6600, 0xff0066, 0x00ccff, 0x66ff00];
      
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2 * 5;
        const height = -1.5 + (i / 40) * 5;
        const radius = 1.6 - (height + 1.5) * 0.22;
        
        // Light bulb mesh
        const bulbGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const bulbMaterial = new THREE.MeshStandardMaterial({
          color: lightColors[i % lightColors.length],
          emissive: lightColors[i % lightColors.length],
          emissiveIntensity: 0,
        });
        
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        tree.add(bulb);
        
        // Point light (only every 4th bulb to save performance)
        if (i % 4 === 0) {
          const light = new THREE.PointLight(lightColors[i % lightColors.length], 0, 2);
          light.position.copy(bulb.position);
          tree.add(light);
          lights.push(light);
          (bulb.material as THREE.MeshStandardMaterial).userData = { light };
        }
        
        (bulb as any).userData = { 
          material: bulbMaterial,
          baseColor: lightColors[i % lightColors.length],
          index: i 
        };
      }
      
      return lights;
    };
  }, []);

  // Create star topper
  const createStar = useMemo(() => {
    return () => {
      const starShape = new THREE.Shape();
      const outerRadius = 0.5;
      const innerRadius = 0.2;
      const spikes = 5;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();
      
      const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
      const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      
      const material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.8,
      });
      
      const star = new THREE.Mesh(geometry, material);
      star.position.y = 4.6;
      star.rotation.y = Math.PI / 2;
      
      return star;
    };
  }, []);

  // Create snow particles
  const createSnow = useMemo(() => {
    return () => {
      const particleCount = 2000;
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 20 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = -0.02 - Math.random() * 0.03;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        
        sizes[i] = 0.05 + Math.random() * 0.1;
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });
      
      return new THREE.Points(geometry, material);
    };
  }, []);

  // Create bokeh particles
  const createBokeh = useMemo(() => {
    return () => {
      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 1] = Math.random() * 15 - 3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
        
        // Warm golden colors
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.5,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });
      
      return new THREE.Points(geometry, material);
    };
  }, []);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1628, 10, 40);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 15);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.3);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x8899bb, 0.5);
    moonLight.position.set(5, 10, 5);
    scene.add(moonLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.2;
    scene.add(ground);

    // Create tree and decorations
    const tree = createTree();
    createOrnaments(tree);
    const lights = createStringLights(tree);
    const star = createStar();
    tree.add(star);
    scene.add(tree);

    // Create particles
    const snowParticles = createSnow();
    scene.add(snowParticles);

    const bokehParticles = createBokeh();
    scene.add(bokehParticles);

    // Store refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      tree,
      lights,
      star,
      snowParticles,
      bokehParticles,
    };

    onSceneReady?.(scene, camera);

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (!sceneRef.current) return;
      const { snowParticles, tree } = sceneRef.current;
      
      // Animate snow
      const positions = snowParticles.geometry.attributes.position;
      const velocities = snowParticles.geometry.attributes.velocity;
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3] += velocities.array[i * 3];
        positions.array[i * 3 + 1] += velocities.array[i * 3 + 1];
        positions.array[i * 3 + 2] += velocities.array[i * 3 + 2];
        
        // Reset particle when it falls below ground
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3] = (Math.random() - 0.5) * 30;
          positions.array[i * 3 + 1] = 15;
          positions.array[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
      }
      positions.needsUpdate = true;
      
      // Gentle tree sway
      tree.rotation.y = Math.sin(Date.now() * 0.0003) * 0.02;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [createTree, createOrnaments, createStringLights, createStar, createSnow, createBokeh, onSceneReady]);

  // Handle parallax
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, tree } = sceneRef.current;
    
    camera.position.x = parallax.normalizedX * 1.5;
    camera.position.y = 2 + parallax.normalizedY * 0.5;
    camera.lookAt(0, 1, 0);
    
    tree.rotation.y = parallax.normalizedX * 0.1;
  }, [parallax]);

  // Handle animation progress (camera zoom)
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    
    const startZ = 20;
    const endZ = 12;
    camera.position.z = startZ - (startZ - endZ) * Math.min(animationProgress / 30, 1);
  }, [animationProgress]);

  // Handle lights turning on
  useEffect(() => {
    if (!sceneRef.current) return;
    const { tree, lights, star, bokehParticles } = sceneRef.current;
    
    if (lightsOn) {
      // Turn on string lights
      tree.traverse((child) => {
        if ((child as THREE.Mesh).material && (child as any).userData?.material) {
          const mat = (child as any).userData.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 1;
        }
      });
      
      lights.forEach((light) => {
        light.intensity = 0.5;
      });
      
      // Illuminate star
      const starMaterial = star.material as THREE.MeshStandardMaterial;
      starMaterial.emissiveIntensity = 2;
      
      // Show bokeh
      const bokehMaterial = bokehParticles.material as THREE.PointsMaterial;
      bokehMaterial.opacity = 0.6;
    }
  }, [lightsOn]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
