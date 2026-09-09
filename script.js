
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
if(toggle && links){
  toggle.addEventListener('click',()=>links.classList.toggle('open'));
}
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id && id!=='#'){
      const el=document.querySelector(id);
      if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});links?.classList.remove('open');}
    }
  });
});
