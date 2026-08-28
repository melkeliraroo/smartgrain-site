const menuButton=document.querySelector('.menu');
const navLinks=document.getElementById('links');
if(menuButton&&navLinks){
  menuButton.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
  navLinks.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navLinks.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
}
const prices={'agro-4-0-fisico':'R$ 79,90','agro-4-0-ebook':'R$ 19,99','do-talhao-a-nuvem-fisico':'R$ 89,90','do-talhao-a-nuvem-ebook':'R$ 27,90'};
const detailStyle=document.createElement('style');
detailStyle.textContent='.detail-price{margin:auto 0 1rem;padding-top:.2rem}.detail-price span{display:block;color:#77827a;font-size:.68rem}.detail-price strong{display:block;font-family:"Fraunces",serif;font-size:2rem;color:var(--g);line-height:1.2;margin-top:.12rem}';
document.head.appendChild(detailStyle);
document.querySelectorAll('[data-checkout]').forEach(link=>{
  const card=link.closest('.format-card'),price=prices[link.dataset.checkout];
  if(card&&price&&!card.querySelector('.detail-price')){const element=document.createElement('div');element.className='detail-price';element.innerHTML=`<span>Preço à vista</span><strong>${price}</strong>`;card.insertBefore(element,link)}
  link.addEventListener('click',()=>{if(typeof gtag==='function')gtag('event','begin_checkout',{item_name:link.dataset.checkout})});
});
