// Capture the WebGL drawing buffer in the same task as the deterministic export render.
// A later element screenshot also includes mobile compositor scaling and intervening RAFs.
export async function captureRobotFrame(page,time){
 const result=await page.evaluate(time=>{
  const frame=window.renderRobotFrame(time),canvas=document.querySelector('#robot-canvas');
  return {...frame,png:canvas.toDataURL('image/png')};
 },time);
 return Buffer.from(result.png.slice(result.png.indexOf(',')+1),'base64');
}
