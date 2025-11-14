(async ()=>{
  try{
    const r = await fetch('http://127.0.0.1:3000/api/courses');
    console.log('status', r.status);
    const t = await r.text();
    console.log('body', t.slice(0,200));
  } catch(e){
    console.error('err', e.message);
  }
})();
