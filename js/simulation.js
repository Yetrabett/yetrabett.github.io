(function(){
  const mount=document.getElementById('fc-stage');
  if(!mount) return;
  const scene=new THREE.Scene();
  const cGray=0x8b8f96, cBlue=0x4a95e0, cCoral=0xe2703a, cPurple=0x9089e6, cAccent=0xf2f0ea;

  const camera=new THREE.PerspectiveCamera(38,1,0.1,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,0.75));
  const dl=new THREE.DirectionalLight(0xffffff,0.9);
  dl.position.set(4,6,5);
  scene.add(dl);
  const dl2=new THREE.DirectionalLight(0xffffff,0.25);
  dl2.position.set(-5,-3,-4);
  scene.add(dl2);

  function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.5,metalness:0.25});}
  const shaftMat=new THREE.MeshStandardMaterial({color:cGray,roughness:0.4,metalness:0.55});
  const accentMat=new THREE.MeshStandardMaterial({color:cAccent,roughness:0.4,metalness:0.3});
  const sheaveMat=mat(cCoral);
  const beltMat=new THREE.MeshStandardMaterial({color:cGray,roughness:0.6,transparent:true,opacity:0.35,side:THREE.DoubleSide});

  function addRidges(parent,radius,length,count,mat_){
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2;
      const fin=new THREE.Mesh(new THREE.BoxGeometry(0.09,length*0.92,0.09),mat_);
      fin.position.set(radius*Math.cos(a),0,radius*Math.sin(a));
      parent.add(fin);
    }
  }
  function addStripe(parent,radius,length,mat_){
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.07,length*0.96,0.07),mat_);
    s.position.set(radius+0.03,0,0);
    parent.add(s);
  }
  function addBolts(parent,count,mat_){
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2;
      const b=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),mat_);
      b.position.set(0.13,0.85*Math.cos(a),0.85*Math.sin(a));
      parent.add(b);
    }
  }

  const CVT_IN_X=-1.6, CVT_OUT_X=-0.4;
  const rMin=0.35, rMax=1.4, gapMin=0.08, gapMax=0.9;

  const motor=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,2,20),mat(cBlue));
  motor.rotation.z=Math.PI/2; motor.position.set(-8,0,0); scene.add(motor);
  addRidges(motor,1.32,2,8,accentMat);

  const inputShaft=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,(CVT_IN_X-(-7)),14),shaftMat);
  inputShaft.rotation.z=Math.PI/2; inputShaft.position.set((-7+CVT_IN_X)/2,0,0); scene.add(inputShaft);
  addStripe(inputShaft,0.18,(CVT_IN_X-(-7)),accentMat);

  const gen=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,2.4,20),mat(cPurple));
  gen.rotation.z=Math.PI/2; gen.position.set(6.2,0,0); scene.add(gen);
  addRidges(gen,1.42,2.4,8,accentMat);

  const outputShaft=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,(5.0-CVT_OUT_X),14),shaftMat);
  outputShaft.rotation.z=Math.PI/2; outputShaft.position.set((CVT_OUT_X+5.0)/2,0,0); scene.add(outputShaft);
  addStripe(outputShaft,0.18,(5.0-CVT_OUT_X),accentMat);

  const rotorGroup=new THREE.Group(); rotorGroup.position.set(4.9,0,0); scene.add(rotorGroup);
  rotorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,1.6,0.3),mat(0xffffff)));
  rotorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,0.3,1.6),mat(0xffffff)));

  function makeSheave(){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.22,20),sheaveMat);
    m.rotation.z=Math.PI/2;
    addBolts(m,6,accentMat);
    return m;
  }
  const inFixed=makeSheave(), inMove=makeSheave();
  const outFixed=makeSheave(), outMove=makeSheave();
  [inFixed,inMove,outFixed,outMove].forEach(m=>scene.add(m));
  function setSheaveRadius(mesh,r){ mesh.scale.set(r,1,r); }

  let beltMesh=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,CVT_OUT_X-CVT_IN_X,24,1,true),beltMat);
  beltMesh.rotation.z=Math.PI/2; beltMesh.position.set((CVT_IN_X+CVT_OUT_X)/2,0,0); scene.add(beltMesh);

  const HALF_W=9.6, HALF_H=2.1;
  const target=new THREE.Vector3(-0.5,0,0);
  let theta=0.55,phi=1.2,radius=15;

  function fitCamera(){
    const w=mount.clientWidth||380,h=mount.clientHeight||300;
    renderer.setSize(w,h);
    camera.aspect=w/h; camera.updateProjectionMatrix();

    const vFov=camera.fov*Math.PI/180;
    const hFov=2*Math.atan(Math.tan(vFov/2)*camera.aspect);
    const distV=HALF_H/Math.tan(vFov/2);
    const distH=HALF_W/Math.tan(hFov/2);
    radius=Math.max(distV,distH)*1.12;

    updateCam();
  }
  function updateCam(){
    camera.position.set(
      target.x+radius*Math.sin(phi)*Math.sin(theta),
      target.y+radius*Math.cos(phi),
      target.z+radius*Math.sin(phi)*Math.cos(theta)
    );
    camera.lookAt(target);
  }
  fitCamera();
  window.addEventListener('resize',fitCamera);

  let dragging=false,lastX=0,lastY=0;
  mount.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;mount.classList.add('dragging');mount.setPointerCapture(e.pointerId);});
  mount.addEventListener('pointerup',()=>{dragging=false;mount.classList.remove('dragging');});
  mount.addEventListener('pointercancel',()=>{dragging=false;mount.classList.remove('dragging');});
  mount.addEventListener('pointermove',e=>{
    if(!dragging)return;
    theta-=(e.clientX-lastX)*0.006;
    phi=Math.min(2.5,Math.max(0.4,phi-(e.clientY-lastY)*0.006));
    lastX=e.clientX;lastY=e.clientY;
    updateCam();
  });

  const rpmEl=document.getElementById('fc-rpm'),cvtEl=document.getElementById('fc-cvt'),polesEl=document.getElementById('fc-poles');
  let state={rpm:1500,nOut:1500,f:50};

  function recompute(){
    const rpm=parseFloat(rpmEl.value);
    const ratio=parseFloat(cvtEl.value);
    const poles=parseInt(polesEl.value);

    let r1=0.9*Math.sqrt(ratio), r2=0.9/Math.sqrt(ratio);
    r1=Math.min(rMax,Math.max(rMin,r1));
    r2=Math.min(rMax,Math.max(rMin,r2));
    const nOut=rpm*(r1/r2);
    const f=(nOut*poles)/120;
    state.rpm=rpm; state.nOut=nOut; state.f=f;

    document.getElementById('fc-rpmOut').textContent=Math.round(rpm)+' rpm';
    document.getElementById('fc-cvtOut').textContent=ratio.toFixed(2)+' : 1';
    document.getElementById('fc-polesOut').textContent=poles;
    document.getElementById('fc-nOut').textContent=Math.round(nOut).toLocaleString()+' rpm';
    document.getElementById('fc-fOut').textContent=f.toFixed(1)+' Hz';

    setSheaveRadius(inFixed,r1); setSheaveRadius(inMove,r1);
    setSheaveRadius(outFixed,r2); setSheaveRadius(outMove,r2);

    const gap1=gapMax-((r1-rMin)/(rMax-rMin))*(gapMax-gapMin);
    const gap2=gapMax-((r2-rMin)/(rMax-rMin))*(gapMax-gapMin);
    inFixed.position.set(CVT_IN_X,0,0);
    inMove.position.set(CVT_IN_X-gap1,0,0);
    outFixed.position.set(CVT_OUT_X,0,0);
    outMove.position.set(CVT_OUT_X+gap2,0,0);

    beltMesh.geometry.dispose();
    beltMesh.geometry=new THREE.CylinderGeometry(r1,r2,CVT_OUT_X-CVT_IN_X,24,1,true);

    const cycles=Math.max(1,Math.min(10,f/15));
    let d='M30 45'; const w=320,steps=80;
    for(let i=0;i<=steps;i++){
      const x=30+w*i/steps;
      const y=45-30*Math.sin(2*Math.PI*cycles*i/steps);
      d+=' L'+x.toFixed(1)+' '+y.toFixed(1);
    }
    document.getElementById('fc-wave').setAttribute('d',d);
  }
  [rpmEl,cvtEl,polesEl].forEach(el=>el.addEventListener('input',recompute));
  recompute();

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED=0.4;
  let last=null;
  function animate(t){
    if(last===null)last=t;
    const dt=(t-last)/1000; last=t;
    if(!reduce){
      const spinIn=state.rpm/60*2*Math.PI*dt*SPEED;
      const spinOut=state.nOut/60*2*Math.PI*dt*SPEED;
      motor.rotation.x+=spinIn; inputShaft.rotation.x=motor.rotation.x;
      inFixed.rotation.x+=spinIn; inMove.rotation.x+=spinIn;
      outputShaft.rotation.x+=spinOut;
      outFixed.rotation.x+=spinOut; outMove.rotation.x+=spinOut;
      rotorGroup.rotation.x+=spinOut;
      if(!dragging) theta+=dt*0.08;
      updateCam();
    }
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  new ResizeObserver(fitCamera).observe(mount);
})();
