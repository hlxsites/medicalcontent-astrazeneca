export default function decorate(block) {
  if (block.classList.contains('is-loaded')) {
    return;
  }
  const poster = block.querySelector('img') ? `poster="${block.querySelector('img').src}"` : '';
  const a = block.querySelector('a');
  const href = a.getAttribute('href');
  const url = new URL(href, window.location.href);
  const { hostname } = url;
  let { pathname } = url;

  if (hostname.includes('hlx.blob.core')) {
    // transform links from blob
    const helixId = pathname.split('/')[2];
    const type = href.includes('.mp4') ? 'mp4' : 'gif';
    pathname = `/media_${helixId}.${type}`;
  }

  const video = document.createElement('div');
  video.classList.add('video-wrapper');
  video.innerHTML = `<video controls ${poster}>
    <source src=".${pathname}" type="video/mp4">
  </video>`;
  block.innerHTML = '';
  block.prepend(video);
  block.classList.add('is-loaded');
}
