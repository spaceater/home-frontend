<template>
  <div id="show_area">
    <div id="background_zone" ref="backgroundZoneRef"></div>
    <div id="moving_zone" ref="movingZoneRef">
      <div class="moving_button" id="page_view">
        <img src="@/assets/page_view_icon.svg" alt="page view icon" style="width: 2.5rem;"><p>loading</p>
      </div>
      <div class="moving_button" id="add_image_button" ref="addImageButtonRef">
        <p>loading</p>
      </div>
      <div class="moving_button" id="remove_image_button" ref="removeImageButtonRef">
        <p>loading</p>
      </div>
      <div class="moving_button" id="interval_estimate" @click="goIntervalEstimate">
        <p>区间估计可视化</p>
      </div>
      <div class="moving_button" id="The_Capitalist_Unconscious_Marx_and_Lacan" @click="goBook">
        <p>资本主义的无意识：马克思与拉康</p>
      </div>
      <div class="moving_button" id="ismismcube" @click="goIsmismcube">
        <p>主义主义魔方</p>
      </div>
      <div class="moving_button" id="ai" @click="goAi">
        <p>主义主义ai</p>
      </div>
    </div>
  </div>
  <div id="ICP" style="text-align:center;">
    <a href="https://beian.miit.gov.cn/" target="_blank" style="text-decoration:none;color:black;">京ICP备2024067574号-2</a>
    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802044944" target="_blank" style="text-decoration:none;color:black;">京公网安备11010802044944</a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { buildApiUrl } from '@/config/api'
import { buildStaticUrl } from '@/config/static'

const buildHomeApiUrl = (path: string): string => {
  return buildApiUrl(`/home${path.startsWith('/') ? '' : '/'}${path}`)
}

const buildHomeStaticUrl = (path: string): string => {
  return buildStaticUrl(`/home${path.startsWith('/') ? '' : '/'}${path}`)
}

const backgroundZoneRef = ref<HTMLDivElement | null>(null)
const movingZoneRef = ref<HTMLDivElement | null>(null)
const addImageButtonRef = ref<HTMLDivElement | null>(null)
const removeImageButtonRef = ref<HTMLDivElement | null>(null)
const background_data = ref(null)
const moving_speed = ref(1)
const time_before = ref(performance.now())
const available_moving_image = ref<string[]>([])

type MovingElement = HTMLElement & {
  position_x: number
  position_y: number
  direction_x: number
  direction_y: number
  image_name: string
}

const goIntervalEstimate = () => { window.location.href = 'https://www.maybered.com/interval-estimate' }
const goBook = () => { window.location.href = 'https://spaceater.github.io/The-Capitalist-Unconscious-Marx-and-Lacan/' }
const goIsmismcube = () => { window.location.href = 'https://www.ismismtag.com' }
const goAi = () => { window.location.href = 'https://www.ismismtag.com/ai' }

const initMovingButton = () => {
  if (!movingZoneRef.value) return
  for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
    moving_button.position_x = Math.random()*(movingZoneRef.value.clientWidth-moving_button.offsetWidth)
    moving_button.position_y = Math.random()*(movingZoneRef.value.clientHeight-moving_button.offsetHeight)
    // 速度为每秒0.5*3rem~1*3rem
    moving_button.direction_x = (Math.random()>0.5?-1:1)*parseFloat(((Math.random()+1)/2).toString())*parseFloat(document.documentElement.style.fontSize)*3/1000
    moving_button.direction_y = (Math.random()>0.5?-1:1)*parseFloat(((Math.random()+1)/2).toString())*parseFloat(document.documentElement.style.fontSize)*3/1000
  }
}

const initBackgroundImage = async () => {
  const response = await fetch(buildHomeStaticUrl("/background.json"))
  background_data.value = await response.json()
  while(await addBackgroundImage()) {}
}

const addBackgroundImage = () => {
  return new Promise((resolve) => {
    if (!background_data.value || !backgroundZoneRef.value) return resolve(false)
    let background_images_data: any[] = background_data.value["available-images"]
    for(const background_image_data of document.querySelectorAll(".background_image")) {
      const src = background_image_data.getAttribute("src") ?? ""
      const parts = src.split('/')
      const last = parts[parts.length - 1] ?? ""
      const name = last.split('.')[0] ?? ""
      background_images_data = background_images_data.filter((item: any)=>(item.name != name))
    }
    const area_size: [number, number] = background_data.value["area-size"]
    const [areaW = 0, areaH = 0] = area_size
    let magnification_times
    let visible_area: [number, number, number, number]
    if((areaW/areaH) > (backgroundZoneRef.value.clientWidth/backgroundZoneRef.value.clientHeight)) {
      magnification_times = backgroundZoneRef.value.clientHeight/areaH
      visible_area = [Math.ceil((areaW-backgroundZoneRef.value.clientWidth/magnification_times)/2), 0, Math.ceil((areaW+backgroundZoneRef.value.clientWidth/magnification_times)/2), areaH]
    } else {
      magnification_times = backgroundZoneRef.value.clientWidth/areaW
      visible_area = [0,Math.ceil((areaH-backgroundZoneRef.value.clientHeight/magnification_times)/2), areaW, Math.ceil((areaH+backgroundZoneRef.value.clientHeight/magnification_times)/2)]
    }
    background_images_data = background_images_data.filter((item: any)=>(
      item.position[0] < visible_area[2] &&
      item.position[1] < visible_area[3] &&
      item.position[0] + item.position[2]>visible_area[0] &&
      item.position[1] + item.position[3]>visible_area[1]))
    if (background_images_data.length == 0) return resolve(false)
    const background_image_data = background_images_data.reduce((pre, cur)=>((pre.zindex < cur.zindex) ? pre : cur))
    const new_background_image = new Image()
    new_background_image.className = "background_image"
    new_background_image.alt = "background image"
    backgroundZoneRef.value.appendChild(new_background_image)
    Object.assign(new_background_image.style, {
      transform: `translate(${(background_image_data.position[0] - visible_area[0]) * magnification_times}px,
        ${(background_image_data.position[1] - visible_area[1]) * magnification_times}px)`,
      width: `${background_image_data.position[2] * magnification_times}px`,
      height: `${background_image_data.position[3] * magnification_times}px`,
      zIndex: background_image_data.zindex
    })
    void new_background_image.offsetWidth
    new_background_image.onload = () => {
      new_background_image.addEventListener('transitionend', ()=>resolve(true))
      new_background_image.style.opacity = "1"
    }
    new_background_image.onerror = () => resolve(false)
    new_background_image.src = buildHomeStaticUrl("/images/backgrounds/" + background_image_data.name + ".png")
  })
}

const handleWindowResize = async () => {
  if (!backgroundZoneRef.value || !movingZoneRef.value || !background_data.value) return
  const area_size: [number, number] = background_data.value["area-size"]
  const [areaW = 0, areaH = 0] = area_size
  let magnification_times
  let visible_area: [number, number, number, number]
  if((areaW/areaH) > (backgroundZoneRef.value.clientWidth/backgroundZoneRef.value.clientHeight)) {
    magnification_times = backgroundZoneRef.value.clientHeight/areaH
    visible_area = [Math.ceil((areaW-backgroundZoneRef.value.clientWidth/magnification_times)/2), 0, Math.ceil((areaW+backgroundZoneRef.value.clientWidth/magnification_times)/2), areaH]
  } else {
    magnification_times = backgroundZoneRef.value.clientWidth/areaW
    visible_area = [0,Math.ceil((areaH-backgroundZoneRef.value.clientHeight/magnification_times)/2), areaW, Math.ceil((areaH+backgroundZoneRef.value.clientHeight/magnification_times)/2)]
  }
  let background_images_data: any[] = background_data.value["available-images"]
  for(const background_image of document.querySelectorAll<HTMLImageElement>(".background_image")){
    const src = background_image.getAttribute("src") ?? ""
    const parts = src.split('/')
    const last = parts[parts.length - 1] ?? ""
    const name = last.split('.')[0] ?? ""
    const background_image_data = (background_images_data.filter((item: any)=>(item.name == name)))[0]
    if (background_image_data) {
      Object.assign(background_image.style, {
        transform: `translate(${(background_image_data.position[0] - visible_area[0]) * magnification_times}px,
          ${(background_image_data.position[1] - visible_area[1]) * magnification_times}px)`,
        width: `${background_image_data.position[2] * magnification_times}px`,
        height: `${background_image_data.position[3] * magnification_times}px`,
      })
    }
  }
  while(await addBackgroundImage())
  for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
    if(moving_button.position_x + moving_button.offsetWidth > movingZoneRef.value.clientWidth){
      moving_button.position_x = movingZoneRef.value.clientWidth - moving_button.offsetWidth
    }
    if(moving_button.position_y + moving_button.offsetHeight > movingZoneRef.value.clientHeight){
      moving_button.position_y = movingZoneRef.value.clientHeight - moving_button.offsetHeight
    }
  }
  for(const moving_image of document.querySelectorAll<MovingElement>(".moving_image")){
    if(moving_image.position_x + moving_image.offsetWidth > movingZoneRef.value.clientWidth){
      moving_image.position_x = movingZoneRef.value.clientWidth - moving_image.offsetWidth
    }
    if(moving_image.position_y + moving_image.offsetHeight > movingZoneRef.value.clientHeight){
      moving_image.position_y = movingZoneRef.value.clientHeight - moving_image.offsetHeight
    }
  }
}

const initMovingImage = async () => {
  const response = await fetch(buildHomeStaticUrl("/figure.json"))
  available_moving_image.value = await response.json()
  const promises_list = []
  let moving_image_sum = Math.ceil(Math.random() * available_moving_image.value.length)
  for(let i = 0; i < moving_image_sum; i++){
    promises_list.push(addMovingImage())
  }
  Promise.all(promises_list).then(() => {
    if (addImageButtonRef.value) {
      addImageButtonRef.value.addEventListener("click",function(){
        addMovingImage().then(success => {
          if(!success){
            moving_speed.value = moving_speed.value + 0.1 > 3 ? 3 : moving_speed.value + 0.1
          }
        })
      })
      addImageButtonRef.value.innerHTML = ""
      addImageButtonRef.value.classList.add("add_image_button_completed")
    }
    if (removeImageButtonRef.value) {
      removeImageButtonRef.value.addEventListener("click",function(){
        const moving_images = document.querySelectorAll(".moving_image")
        if (moving_images.length > 0) {
          removeMovingImage(moving_images[Math.floor(Math.random() * moving_images.length)] as MovingElement)
          moving_speed.value = moving_speed.value - 0.1 < 1 ? 1 : moving_speed.value - 0.1
        }
      });
      removeImageButtonRef.value.innerHTML = ""
      removeImageButtonRef.value.classList.add("remove_image_button_completed")
    }
  });
}

const addMovingImage = () => {
  return new Promise((resolve) => {
    if (!movingZoneRef.value) return resolve(false)
    const image_name = getNewFigureName()
    if(image_name == "") return resolve(false)
    const new_moving_image = new Image() as HTMLImageElement & MovingElement
    new_moving_image.image_name = image_name
    new_moving_image.alt = "figure image"
    new_moving_image.onload = () => {
      if(new_moving_image.naturalWidth > new_moving_image.naturalHeight){
        new_moving_image.style.width = "8rem"
      }else{
        new_moving_image.style.height = "8rem"
      }
      new_moving_image.className = "moving_image"
      movingZoneRef.value?.appendChild(new_moving_image)
      void new_moving_image.offsetWidth
      new_moving_image.addEventListener('transitionend', ()=>resolve(true))
      new_moving_image.style.opacity = "1"
      resetMovingImageDirection(new_moving_image)
      resetMovingImagePosition(new_moving_image)
      new_moving_image.addEventListener("click",()=>refreshMovingImage(new_moving_image));
      resolve(true)
    }
    new_moving_image.onerror = () => {
      available_moving_image.value.push(image_name)
      if (new_moving_image.parentNode) {
        new_moving_image.remove()
      }
      resolve(false)
    }
    new_moving_image.src = buildHomeStaticUrl("/images/figures/" + image_name + ".jpg")
  })
}

const getNewFigureName = (): string => {
  if (available_moving_image.value.length === 0) return ""
  const random_index = Math.floor(Math.random() * available_moving_image.value.length)
  return available_moving_image.value.splice(random_index, 1)[0] ?? ""
}

const resetMovingImageDirection = (moving_image: MovingElement) => {
  moving_image.direction_x = (Math.random()>0.5?-1:1)*parseFloat(((Math.random()*3+1)).toString())*parseFloat(document.documentElement.style.fontSize)*3/1000;//速度为每秒1*3rem~4*3rem
  moving_image.direction_y = (Math.random()>0.5?-1:1)*parseFloat(((Math.random()*3+1)).toString())*parseFloat(document.documentElement.style.fontSize)*3/1000;
}

const resetMovingImagePosition = (moving_image: MovingElement) => {
  if (!movingZoneRef.value) return
  const moving_zone_width = movingZoneRef.value.clientWidth;
  const moving_zone_height = movingZoneRef.value.clientHeight;
  let is_satisfied = false;
  let new_position_x = 0;
  let new_position_y = 0;
  while(!is_satisfied){
    new_position_x = Math.random() * (moving_zone_width - moving_image.offsetWidth);
    new_position_y = Math.random() * (moving_zone_height - moving_image.offsetHeight);
    is_satisfied = true;
    for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
      if( new_position_x < moving_button.position_x + moving_button.offsetWidth &&
        new_position_x + moving_image.offsetWidth > moving_button.position_x &&
        new_position_y < moving_button.position_y + moving_button.offsetHeight &&
        new_position_y + moving_image.offsetHeight > moving_button.position_y){
        is_satisfied = false;
        break;
      }
    }
  }
  moving_image.position_x = new_position_x;
  moving_image.position_y = new_position_y;
}

const refreshMovingImage = (moving_image: MovingElement) => {
  const image_name = getNewFigureName()
  if(image_name == ""){
    resetMovingImageDirection(moving_image)
    return
  }
  if (!movingZoneRef.value) return
  const new_moving_image = new Image() as HTMLImageElement & MovingElement
  new_moving_image.image_name = image_name
  new_moving_image.alt = "figure image"
  new_moving_image.onload = ()=>{
    if(new_moving_image.naturalWidth > new_moving_image.naturalHeight){
      new_moving_image.style.width = "8rem"
    }else{
      new_moving_image.style.height = "8rem"
    }
    new_moving_image.className = "moving_image"
    movingZoneRef.value!.appendChild(new_moving_image)
    void new_moving_image.offsetWidth
    new_moving_image.position_x = moving_image.position_x
    new_moving_image.position_y = moving_image.position_y
    new_moving_image.style.opacity = "1"
    removeMovingImage(moving_image, false)
    resetMovingImageDirection(new_moving_image)
    new_moving_image.addEventListener("click",()=>refreshMovingImage(new_moving_image))
  }
  new_moving_image.onerror = () => {
    available_moving_image.value.push(image_name)
    if (new_moving_image.parentNode) {
      new_moving_image.remove()
    }
  }
  new_moving_image.src = buildHomeStaticUrl("/images/figures/" + image_name + ".jpg")
}

const moveButtonsAndImages = (time_now: number) => {
  let interval = time_now - time_before.value;
  // 帧率最低为12，即帧间隔为83.33ms，如果高于此值，则页面冻结，按钮和图片不会移动
  interval = interval > 84 ? 0 : interval;
  time_before.value = time_now;
  moveButtons(interval);
  moveImages(interval);
  requestAnimationFrame(moveButtonsAndImages);
}

const moveButtons = (interval: number) => {
  if (!movingZoneRef.value) return
  for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
    //碰撞边界改变方向，使用绝对值防卡死
    const button_next_position_x = moving_button.position_x + moving_button.direction_x * interval * moving_speed.value;
    if(button_next_position_x < 0){
      moving_button.direction_x = Math.abs(moving_button.direction_x);
    }else if(button_next_position_x + moving_button.offsetWidth > movingZoneRef.value.clientWidth){
      moving_button.direction_x = -Math.abs(moving_button.direction_x);
    }
    const button_next_position_y = moving_button.position_y + moving_button.direction_y * interval * moving_speed.value;
    if(button_next_position_y < 0){
      moving_button.direction_y = Math.abs(moving_button.direction_y);
    }else if(button_next_position_y + moving_button.offsetHeight > movingZoneRef.value.clientHeight){
      moving_button.direction_y = -Math.abs(moving_button.direction_y);
    }
    //渲染
    moving_button.style.transform = `translate(${(moving_button.position_x+=moving_button.direction_x*interval*moving_speed.value)}px,${(moving_button.position_y+=moving_button.direction_y*interval*moving_speed.value)}px)`;
  }
}

const moveImages = (interval: number) => {
  if (!movingZoneRef.value) return
  for(const moving_image of document.querySelectorAll<MovingElement>(".moving_image")){
    //碰撞Button改变方向
    const image_position_x = moving_image.position_x;
    const image_position_y = moving_image.position_y;
    let image_next_position_x = image_position_x + moving_image.direction_x * interval * moving_speed.value;
    let image_next_position_y = image_position_y + moving_image.direction_y * interval * moving_speed.value;
    for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
      let button_position_x = moving_button.position_x;
      let button_position_y = moving_button.position_y;
      if (image_next_position_x < button_position_x + moving_button.offsetWidth &&
        image_next_position_x + moving_image.offsetWidth > button_position_x &&
        image_next_position_y < button_position_y + moving_button.offsetHeight &&
        image_next_position_y + moving_image.offsetHeight > button_position_y){
        if (image_position_x - moving_image.direction_x * interval * moving_speed.value > button_position_x + moving_button.offsetWidth ||
          image_position_x - moving_image.direction_x * interval * moving_speed.value + moving_image.offsetWidth < button_position_x){
          moving_image.direction_x = -moving_image.direction_x;
          image_next_position_x = image_position_x + moving_image.direction_x * interval * moving_speed.value;
        }else{
          moving_image.direction_y = -moving_image.direction_y;
          image_next_position_y = image_position_y + moving_image.direction_y * interval * moving_speed.value;
        }
      }
    }
    //碰撞边界改变方向，使用绝对值防卡死
    if(image_next_position_x < 0){
      moving_image.direction_x = Math.abs(moving_image.direction_x);
    }else if(image_next_position_x + moving_image.offsetWidth > movingZoneRef.value.clientWidth){
      moving_image.direction_x = -Math.abs(moving_image.direction_x);
    }
    if(image_next_position_y < 0){
      moving_image.direction_y = Math.abs(moving_image.direction_y);
    }else if(image_next_position_y + moving_image.offsetHeight > movingZoneRef.value.clientHeight){
      moving_image.direction_y = -Math.abs(moving_image.direction_y);
    }
    moving_image.position_x += moving_image.direction_x*interval*moving_speed.value
    moving_image.position_y += moving_image.direction_y*interval*moving_speed.value
    moving_image.style.transform = `translate(${moving_image.position_x}px,${moving_image.position_y}px)`;
    // 与Button重合则销毁
    for(const moving_button of document.querySelectorAll<MovingElement>(".moving_button")){
      if (moving_image.position_x < moving_button.position_x + moving_button.offsetWidth &&
        moving_image.position_x + moving_image.offsetWidth > moving_button.position_x &&
        moving_image.position_y < moving_button.position_y + moving_button.offsetHeight &&
        moving_image.position_y + moving_image.offsetHeight > moving_button.position_y){
        removeMovingImage(moving_image);
        addMovingImage();
        break;
      }
    }
  }
}

const removeMovingImage = (moving_image: MovingElement, fade=true) => {

  if (moving_image.image_name != "") {
    available_moving_image.value.push(moving_image.image_name)
    moving_image.image_name = ""
  }
  if(fade){
    moving_image.className = "moving_image_fade"
    void moving_image.offsetWidth
    moving_image.style.opacity = "0"
    moving_image.addEventListener("transitionend", ()=>{
      moving_image.remove();
    });
  }else{
    moving_image.remove()
  }
}

const showPageView = async () => {
  const response = await fetch(buildHomeApiUrl("/page_view"));
  const data = await response.json();
  const el = document.querySelector("#page_view p")
  if (el) el.textContent = String(data["page_view"]);
}

onMounted(() => {
  document.documentElement.style.fontSize = Math.max(screen.width, screen.height) / 96 + "px"
  initMovingButton();
  showPageView();
  requestAnimationFrame(moveButtonsAndImages);
  window.addEventListener("resize", handleWindowResize);
  initBackgroundImage().then(() => {
    initMovingImage();
  });
})

</script>

<style scoped>

*{
  font-family: "Microsoft YaHei",sans-serif;
  padding: 0;
  margin: 0;
}

html{
  overflow-x: hidden;
  overflow-y: scroll;
}

body::-webkit-scrollbar{
  display: none;
}

#show_area{
  position: absolute;
  left: 0;
  top: 0;
  min-width: 30rem;
  min-height: 30rem;
  width: 100%;
  height: 100%;
  contain: strict;
}

#background_zone{
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(200, 200, 200);
  overflow: hidden;
}

#moving_zone{
  z-index: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  contain: strict;
}

@keyframes buttonFadeIn {
  0% {box-shadow: 0rem 0rem 0rem 0rem rgb(0,0,0,0.6);}
  100% {box-shadow: 1.25rem 0.8rem 0.4rem 0.4rem rgb(0,0,0,0.6);}
}

.moving_button{
  z-index: 1;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 1.25rem 0.8rem 0.4rem 0.4rem rgb(0,0,0,0.6);
  cursor: pointer;
  animation: buttonFadeIn 0.5s;
}

#add_image_button{
  position: absolute;
  background-color: gray;
  width: 6rem;
  height: 6rem;
  font-size: 1.3rem;
  font-weight: bold;
}

.add_image_button_completed::before{
  content: "";
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  width: 4rem;
  height: 1rem;
  background-color: black;
    border-radius: 1rem
}

.add_image_button_completed::after{
  content: "";
  position: absolute;
  left: 2.5rem;
  top: 1rem;
  width: 1rem;
  height: 4rem;
  background-color: black;
    border-radius: 1rem
}

#remove_image_button{
  position: absolute;
  background-color: gray;
  width: 6rem;
  height: 6rem;
  font-size: 1.3rem;
  font-weight: bold;
}

.remove_image_button_completed::before{
  content: "";
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  width: 4rem;
  height: 1rem;
  background-color: black;
  border-radius: 1rem;
}

#ismismcube{
  width: 9rem;
  height: 9rem;
  font-size: 2rem;
  text-align: center;
  background-color: brown;
  font-weight: bold;
}

#ai{
  width: 9rem;
  height: 9rem;
  font-size: 2rem;
  text-align: center;
  background-color: rgb(60, 60, 160);
  font-weight: bold;
}

#The_Capitalist_Unconscious_Marx_and_Lacan{
  width: 9rem;
  height: 9rem;
  font-size: 1.6rem;
  text-align: center;
  background-color: rgb(197, 129, 41);
  font-weight: bold;
}

#interval_estimate{
  position: absolute;
  width: 6rem;
  height: 6rem;
  font-size: 1.25rem;
  background-color: rgb(17, 113, 173);
  font-weight: bold;
}

#page_view{
  position: absolute;
  display: flex;
  width: 6rem;
  height: 6rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  font-size: 1.5rem;
  background-color: rgb(19, 180, 129);
  font-weight: bold;
}

#ICP{
  position: absolute;
  display: block;
  left: 0;
  top: 100%;
  width: 100%;
  height: 1.5rem;
  justify-content: center;
  background-color: rgb(200, 200, 200);
}

</style>

<style>

#show_area .background_image{
  position: absolute;
  box-shadow: 0.4rem 0.256rem 0.4rem 0.256rem rgb(0,0,0,0.6);
  transition: opacity 0.15s ease-in;
  opacity: 0;
}

#show_area .moving_image{
  position: absolute;
  box-shadow: 1rem 0.64rem 0.25rem 0.25rem rgb(0,0,0,0.6);
  cursor: zoom-in;
  transition: opacity 0.4s;
  opacity: 0;
}

#show_area .moving_image_fade{
  position: absolute;
  box-shadow: 1rem 0.64rem 0.25rem 0.25rem rgb(0,0,0,0.6);
  cursor: zoom-in;
  transition: opacity 0.4s;
  opacity: 1;
}

</style>
