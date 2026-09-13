<template>
  <main class="odx" :class="`odx--${activeId}`" @pointermove="trackPointer" @pointerleave="resetPointer">
    <div class="odx__ambient" aria-hidden="true"></div>
    <div class="odx__grain" aria-hidden="true"></div>

    <header class="odx__nav">
      <button class="odx__brand" type="button" @click="$emit('back')" aria-label="Back to CV Studio">
        <span class="odx__brand-mark">CV</span>
        <span><b>Direction Lab</b><small>Original portfolio worlds</small></span>
      </button>
      <div class="odx__nav-meta"><span>10 directions</span><span>01 shared profile</span><span>0 copied layouts</span></div>
      <a class="odx__studio-link" href="#studio" @click.prevent="$emit('back')">CV Studio <b>↗</b></a>
    </header>

    <section class="odx__hero">
      <div class="odx__intro">
        <span class="odx__eyebrow">CHOOSE HOW YOUR STORY MOVES</span>
        <h1>Not another<br /><em>CV template.</em></h1>
        <p>Mười visual world được thiết kế từ đầu cho cùng một hồ sơ. Không mô phỏng giao diện sản phẩm nổi tiếng; mỗi direction dùng một logic kể chuyện, hình học và nhịp chuyển động riêng.</p>
        <div class="odx__intro-foot"><span>Original system</span><i></i><span>Career storytelling</span><i></i><span>Motion-aware</span></div>
      </div>

      <div class="odx__stage-wrap">
        <div class="odx__stage" :style="stageStyle">
          <div class="odx__stage-top">
            <span>{{ activeConcept.code }}</span>
            <span>{{ activeConcept.intent }}</span>
          </div>

          <div class="odx__visual" aria-hidden="true">
            <template v-if="activeId === 'signal-field'">
              <div class="signal-core"><b>{{ initials }}</b><span>{{ profile.role }}</span></div>
              <i v-for="n in 5" :key="`signal-ring-${n}`" class="signal-ring" :style="{ '--i': n }"></i>
              <span v-for="(skill, index) in profile.skills.slice(0,6)" :key="skill" class="signal-node" :style="{ '--i': index }">{{ skill }}</span>
            </template>

            <template v-else-if="activeId === 'prism-shift'">
              <div class="prism-title"><small>PROFILE / REFRACTED</small><b>{{ profile.name }}</b></div>
              <div class="prism-slab slab-a"></div><div class="prism-slab slab-b"></div><div class="prism-slab slab-c"></div>
              <div class="prism-copy">{{ shortSummary }}</div>
            </template>

            <template v-else-if="activeId === 'orbit-ledger'">
              <div class="orbit-ledger-center"><small>CAREER</small><b>{{ experienceYears }}</b><span>YEARS / TRACK</span></div>
              <div v-for="(job, index) in profile.experience.slice(0,4)" :key="job.company" class="orbit-ledger-item" :style="{ '--i': index }"><span>0{{ index + 1 }}</span><b>{{ job.company }}</b><small>{{ job.role }}</small></div>
            </template>

            <template v-else-if="activeId === 'threadscape'">
              <svg class="thread-map" viewBox="0 0 700 420" role="presentation"><path d="M45 325 C170 70 305 390 440 145 S615 70 665 235"/><path d="M45 250 C165 370 275 70 420 260 S575 355 660 120"/><path d="M65 105 C210 210 300 140 410 82 S570 130 642 290"/></svg>
              <div v-for="(project,index) in profile.projects.slice(0,4)" :key="project.name" class="thread-project" :style="{ '--i': index }"><span>0{{ index + 1 }}</span><b>{{ project.name }}</b><small>{{ compact(project.impact, 42) }}</small></div>
            </template>

            <template v-else-if="activeId === 'kinetic-type'">
              <div class="kinetic-word word-a">DESIGN</div><div class="kinetic-word word-b">SYSTEM</div><div class="kinetic-word word-c">IMPACT</div>
              <div class="kinetic-profile"><span>{{ profile.name }}</span><b>{{ profile.role }}</b></div>
            </template>

            <template v-else-if="activeId === 'atlas-flow'">
              <div class="atlas-grid"></div>
              <div class="atlas-route"></div>
              <div v-for="(job,index) in profile.experience.slice(0,4)" :key="job.company" class="atlas-stop" :style="{ '--i': index }"><i></i><b>{{ job.company }}</b><span>{{ job.period }}</span></div>
              <div class="atlas-label">CAREER ATLAS / {{ profile.location || 'GLOBAL' }}</div>
            </template>

            <template v-else-if="activeId === 'pulse-stack'">
              <div class="pulse-person"><small>NOW</small><b>{{ profile.name }}</b><span>{{ profile.role }}</span></div>
              <div v-for="(metric,index) in profile.highlights.slice(0,4)" :key="metric.label" class="pulse-metric" :style="{ '--i': index }"><b>{{ metric.value }}</b><span>{{ metric.label }}</span></div>
              <div class="pulse-line"><i v-for="n in 24" :key="n" :style="{ '--i': n }"></i></div>
            </template>

            <template v-else-if="activeId === 'lattice'">
              <div class="lattice-grid"><span v-for="n in 24" :key="n" :class="{ hot: [3,6,9,14,18,21].includes(n) }"></span></div>
              <div class="lattice-card"><small>CAPABILITY MATRIX</small><b>{{ profile.name }}</b><div><span v-for="skill in profile.skills.slice(0,7)" :key="skill">{{ skill }}</span></div></div>
            </template>

            <template v-else-if="activeId === 'focus-lens'">
              <div class="lens-ring lens-a"></div><div class="lens-ring lens-b"></div><div class="lens-ring lens-c"></div>
              <div class="lens-focus"><small>FOCUS</small><b>{{ firstProject.name }}</b><span>{{ compact(firstProject.impact, 58) }}</span></div>
              <div class="lens-caption">Everything outside the work fades away.</div>
            </template>

            <template v-else>
              <div class="relay-track"><i v-for="n in 8" :key="n" :style="{ '--i': n }"></i></div>
              <div class="relay-origin"><small>INPUT</small><b>Challenge</b></div>
              <div class="relay-core"><small>DESIGNER</small><b>{{ initials }}</b><span>think → shape → ship</span></div>
              <div class="relay-output"><small>OUTPUT</small><b>{{ firstProject.impact || 'Outcome' }}</b></div>
            </template>
          </div>

          <footer class="odx__stage-footer">
            <div><small>DIRECTION</small><b>{{ activeConcept.name }}</b></div>
            <div><small>BEST FOR</small><b>{{ activeConcept.audience }}</b></div>
            <a :href="`#direction-${activeConcept.id}`">Enter world <span>→</span></a>
          </footer>
        </div>
      </div>
    </section>

    <section class="odx__chooser" aria-labelledby="odx-chooser-title">
      <div class="odx__chooser-head">
        <div><span>01 / DIRECTION MATRIX</span><h2 id="odx-chooser-title">Choose a visual world.</h2></div>
        <p>Mỗi direction thay đổi cách người xem hiểu hồ sơ — không chỉ đổi màu, font hoặc card.</p>
      </div>

      <div class="odx__grid">
        <a v-for="(item,index) in concepts" :key="item.id" :href="`#direction-${item.id}`" class="odx-card" :class="[{ active: activeId === item.id }, `odx-card--${item.id}`]" @mouseenter="preview(item.id)" @focus="preview(item.id)">
          <div class="odx-card__art" aria-hidden="true"><i></i><i></i><i></i><i></i><span>{{ item.code }}</span></div>
          <div class="odx-card__index">{{ String(index + 1).padStart(2,'0') }}</div>
          <div class="odx-card__copy"><small>{{ item.kind }}</small><h3>{{ item.name }}</h3><p>{{ item.summary }}</p></div>
          <div class="odx-card__foot"><span>{{ item.motion }}</span><b>↗</b></div>
        </a>
      </div>
    </section>

    <section class="odx__story">
      <div class="odx__story-title"><span>{{ activeConcept.code }} / STORY LOGIC</span><h2>{{ activeConcept.name }}</h2><p>{{ activeConcept.story }}</p></div>
      <div class="odx__story-grid">
        <article v-for="(step,index) in activeConcept.sequence" :key="step.title"><span>0{{ index + 1 }}</span><h3>{{ step.title }}</h3><p>{{ step.body }}</p></article>
      </div>
      <div class="odx__principle"><span>ORIGINALITY RULE</span><p>Geometry is generated from the career narrative itself: timeline, capability, project impact and interaction state. No branded UI chrome, copied screen composition or trademarked visual motif is required.</p></div>
    </section>

    <footer class="odx__footer"><span>CV Studio / Direction Lab</span><span>Original visual system · Vue · CSS motion · shared profile data</span></footer>
  </main>
</template>

<script>
import { candidate } from '../data/cv'

const STORAGE_KEY = 'cv-studio-profile-v1'
const clone = (value) => JSON.parse(JSON.stringify(value))

const concepts = [
  { id:'signal-field',code:'SGN-01',name:'Signal Field',kind:'Identity field',summary:'Hồ sơ trở thành trường tín hiệu; kỹ năng và thành tựu xuất hiện theo mức liên quan.',intent:'Presence before pages',audience:'Product / UX / AI',motion:'radial drift',story:'Người xem bắt đầu từ một lõi nghề nghiệp rồi khám phá các tín hiệu xung quanh. Không có sidebar hay timeline cổ điển; mức quan trọng được biểu diễn bằng khoảng cách và cường độ.',sequence:[{title:'Core',body:'Tên và vai trò là tâm điểm duy nhất khi mở trang.'},{title:'Signals',body:'Skills, impact và work xuất hiện theo lớp thay vì danh sách.'},{title:'Evidence',body:'Chọn một tín hiệu để đi sâu vào project chứng minh năng lực.'}]},
  { id:'prism-shift',code:'PRM-02',name:'Prism Shift',kind:'Perspective system',summary:'Một hồ sơ được khúc xạ thành nhiều góc nhìn: craft, system, code và impact.',intent:'One person, many angles',audience:'Hybrid designer',motion:'layer refraction',story:'Direction này kể cùng một sự nghiệp qua những lớp góc nhìn chồng lệch. Người xem hiểu rằng một quyết định thiết kế có nhiều mặt: trải nghiệm, hệ thống, kỹ thuật và kết quả.',sequence:[{title:'Surface',body:'Giới thiệu ngắn, rõ và giàu cá tính.'},{title:'Refraction',body:'Mỗi project tách thành problem, decision, system và impact.'},{title:'Recombine',body:'Cuối trang gom các góc nhìn thành capability profile.'}]},
  { id:'orbit-ledger',code:'ORB-03',name:'Orbit Ledger',kind:'Career gravity',summary:'Kinh nghiệm quay quanh một lõi năng lực; seniority thể hiện bằng quỹ đạo thay vì cột năm.',intent:'Experience has gravity',audience:'Senior / Lead',motion:'slow orbit',story:'Thay vì timeline dọc, những giai đoạn có ảnh hưởng lớn nằm gần lõi hơn. Career history trở thành bản đồ trọng lực của kinh nghiệm.',sequence:[{title:'Gravity',body:'Core strengths được đặt ở trung tâm.'},{title:'Orbit',body:'Role và company nằm trên các quỹ đạo theo mức ảnh hưởng.'},{title:'Trajectory',body:'Đường phát triển cho thấy scope và ownership tăng ra sao.'}]},
  { id:'threadscape',code:'THR-04',name:'Threadscape',kind:'Connected work',summary:'Project, skill và quyết định được nối thành các luồng thay vì các card tách rời.',intent:'Show the connections',audience:'Systems thinker',motion:'thread tracing',story:'Mỗi dự án không tồn tại độc lập. Threadscape cho thấy một kỹ năng được hình thành ở đâu, tái sử dụng thế nào và dẫn tới impact tiếp theo ra sao.',sequence:[{title:'Threads',body:'Các năng lực chính chạy xuyên suốt portfolio.'},{title:'Crossings',body:'Project là nơi nhiều năng lực giao nhau.'},{title:'Continuity',body:'Career story kết thúc bằng những pattern lặp lại có chủ đích.'}]},
  { id:'kinetic-type',code:'KNT-05',name:'Kinetic Type',kind:'Type choreography',summary:'Typography trở thành chuyển động kể chuyện, không còn là phần trang trí của layout.',intent:'Words carry motion',audience:'Visual / Brand / UI',motion:'type choreography',story:'Các từ khóa nghề nghiệp thay đổi scale, nhịp và vị trí khi scroll. Nội dung không bị nhồi vào card; chính ngôn ngữ tạo nên sân khấu.',sequence:[{title:'Statement',body:'Một câu định vị cực lớn mở đầu trải nghiệm.'},{title:'Rhythm',body:'Project xuất hiện giữa các nhịp typography có chủ đích.'},{title:'Signature',body:'Kết thúc bằng một câu nghề nghiệp dễ nhớ.'}]},
  { id:'atlas-flow',code:'ATL-06',name:'Atlas Flow',kind:'Career geography',summary:'Hành trình nghề nghiệp được đọc như địa hình: vùng, tuyến, điểm dừng và bước ngoặt.',intent:'A career has terrain',audience:'Multi-domain designer',motion:'route travel',story:'Atlas Flow biến history thành địa hình trừu tượng. Mỗi role là điểm dừng, mỗi thay đổi scope là một đoạn đường và project lớn là landmark.',sequence:[{title:'Origin',body:'Khởi đầu bằng nền tảng nghề nghiệp.'},{title:'Routes',body:'Vai trò và domain tạo thành những tuyến phát triển.'},{title:'Landmarks',body:'Các project lớn đóng vai trò mốc thay đổi năng lực.'}]},
  { id:'pulse-stack',code:'PLS-07',name:'Pulse Stack',kind:'Impact rhythm',summary:'Thành tựu xuất hiện theo nhịp; dữ liệu được cảm nhận trước khi đọc chi tiết.',intent:'Make impact feel alive',audience:'Product / Growth',motion:'metric pulse',story:'Direction dùng nhịp pulse để làm nổi các kết quả đo lường được. Phần mô tả chỉ xuất hiện sau khi người xem đã hiểu mức độ impact.',sequence:[{title:'Pulse',body:'Metrics xuất hiện nhanh và rõ.'},{title:'Context',body:'Mỗi metric mở ra project và vai trò phía sau.'},{title:'Pattern',body:'Các pulse hợp lại thành bức tranh về cách tạo giá trị.'}]},
  { id:'lattice',code:'LTC-08',name:'Lattice',kind:'Capability matrix',summary:'Năng lực là một mạng lưới có cấu trúc, cho thấy breadth lẫn chiều sâu mà không dùng progress bar.',intent:'Capability over decoration',audience:'Design systems / Platform',motion:'cell activation',story:'Lattice tránh progress bar chủ quan. Skill được chứng minh bằng sự liên kết giữa project, responsibility và artifact thật.',sequence:[{title:'Cells',body:'Mỗi capability là một node có bằng chứng.'},{title:'Links',body:'Node sáng lên khi cùng xuất hiện trong một project.'},{title:'Coverage',body:'Người xem thấy ngay vùng mạnh và breadth của hồ sơ.'}]},
  { id:'focus-lens',code:'FCS-09',name:'Focus Lens',kind:'Project immersion',summary:'Mỗi lần chỉ có một project được nhìn rõ; phần còn lại lùi xuống để giảm nhiễu.',intent:'Depth over volume',audience:'Case-study heavy',motion:'focus pull',story:'Thay vì gallery dày đặc, Focus Lens ép portfolio ưu tiên. Một project ở trạng thái focus, mọi nội dung phụ giảm độ nổi để recruiter đọc sâu hơn.',sequence:[{title:'Select',body:'Chọn một flagship project.'},{title:'Focus',body:'Problem, role và decision đi vào vùng rõ nét.'},{title:'Resolve',body:'Impact và bài học đóng project trước khi chuyển focus.'}]},
  { id:'relay',code:'RLY-10',name:'Relay',kind:'Outcome pipeline',summary:'Career story là chuỗi chuyển hóa challenge → thinking → design → shipped outcome.',intent:'Show how value moves',audience:'Design engineer / Product',motion:'energy transfer',story:'Relay mô tả công việc như một dòng chuyển giao giá trị. Người xem thấy rõ designer nhận đầu vào gì, xử lý ra sao và tạo đầu ra nào.',sequence:[{title:'Input',body:'Bài toán, constraint và context đi vào hệ.'},{title:'Transform',body:'Research, design, system thinking và code phối hợp.'},{title:'Output',body:'Sản phẩm, metric và learning đi ra ở cuối relay.'}]},
]

export default {
  name: 'OriginalDirectionExperience',
  props: { directionId: { type: String, default: 'signal-field' } },
  emits: ['back'],
  data() {
    let profile = clone(candidate)
    try { const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (stored && typeof stored === 'object') profile = { ...profile, ...stored } } catch (_) { /* use sample profile */ }
    return { concepts, profile, previewId: '', pointerX: 0, pointerY: 0 }
  },
  computed: {
    activeId() { const id = this.previewId || this.directionId; return concepts.some((item) => item.id === id) ? id : concepts[0].id },
    activeConcept() { return concepts.find((item) => item.id === this.activeId) || concepts[0] },
    initials() { return String(this.profile.name || 'CV').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() },
    firstProject() { return (this.profile.projects || [])[0] || { name: 'Selected work', impact: 'Meaningful outcome' } },
    shortSummary() { return this.compact(this.profile.summary || 'A product-minded designer connecting systems, interface craft and implementation.', 150) },
    experienceYears() { const count = (this.profile.experience || []).length; return count > 3 ? `${count + 2}+` : `${Math.max(count, 1)}+` },
    stageStyle() { return { '--px': `${this.pointerX}px`, '--py': `${this.pointerY}px` } },
  },
  watch: { directionId() { this.previewId = '' } },
  methods: {
    compact(value, max = 72) { const text = String(value || '').trim(); return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text },
    preview(id) { this.previewId = id },
    trackPointer(event) { this.pointerX = (event.clientX / window.innerWidth - .5) * 18; this.pointerY = (event.clientY / window.innerHeight - .5) * 18 },
    resetPointer() { this.pointerX = 0; this.pointerY = 0 },
  },
}
</script>
