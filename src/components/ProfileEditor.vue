<template>
  <aside class="profile-editor" :class="{ open }" aria-label="CV profile editor">
    <div class="editor-backdrop" @click="$emit('close')"></div>
    <div class="editor-panel">
      <header class="editor-header">
        <div>
          <span class="editor-kicker">CV Builder</span>
          <h2>Edit once. Update every CV and web concept.</h2>
        </div>
        <button type="button" class="editor-close" aria-label="Close CV builder" @click="$emit('close')">×</button>
      </header>

      <nav class="editor-tabs" aria-label="CV builder sections">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </nav>

      <div class="editor-body">
        <section v-if="activeTab === 'profile'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>01</span><h3>Profile & contact</h3></div>
            <p>Core information shared by every template and landing concept.</p>
          </div>
          <div class="editor-grid">
            <label class="editor-field editor-field-wide"><span>Full name</span><input :value="profile.name" type="text" @input="update('name', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Role / headline</span><input :value="profile.role" type="text" @input="update('role', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Location</span><input :value="profile.location" type="text" @input="update('location', $event.target.value)" /></label>
            <label class="editor-field"><span>Email</span><input :value="profile.email" type="email" @input="update('email', $event.target.value)" /></label>
            <label class="editor-field"><span>Phone</span><input :value="profile.phone" type="text" @input="update('phone', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Website / portfolio</span><input :value="profile.website" type="text" @input="update('website', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Professional summary</span><textarea :value="profile.summary" rows="7" @input="update('summary', $event.target.value)"></textarea><small>{{ profile.summary.length }} characters</small></label>
          </div>
        </section>

        <section v-else-if="activeTab === 'impact'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>02</span><h3>Impact metrics</h3></div>
            <p>Use concrete numbers. Bento, Executive and Product templates surface these prominently.</p>
          </div>
          <div class="builder-list">
            <article v-for="(item, index) in profile.highlights" :key="`highlight-${index}`" class="builder-card builder-card-compact">
              <div class="builder-card-top"><strong>Metric {{ index + 1 }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('highlights', index, -1)">↑</button><button type="button" :disabled="index === profile.highlights.length - 1" @click="move('highlights', index, 1)">↓</button><button type="button" class="danger" @click="remove('highlights', index)">×</button></div></div>
              <div class="editor-grid"><label class="editor-field"><span>Value</span><input :value="item.value" type="text" placeholder="40%" @input="updateItem('highlights', index, 'value', $event.target.value)" /></label><label class="editor-field"><span>Label</span><input :value="item.label" type="text" placeholder="Faster handoff" @input="updateItem('highlights', index, 'label', $event.target.value)" /></label></div>
            </article>
          </div>
          <button class="builder-add" type="button" @click="$emit('add-item', { section: 'highlights' })">+ Add metric</button>
        </section>

        <section v-else-if="activeTab === 'experience'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>03</span><h3>Experience</h3></div>
            <p>Keep each role focused on scope, responsibility and measurable outcomes.</p>
          </div>
          <div class="builder-list">
            <article v-for="(job, index) in profile.experience" :key="`experience-${index}`" class="builder-card">
              <div class="builder-card-top"><strong>{{ job.role || `Experience ${index + 1}` }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('experience', index, -1)">↑</button><button type="button" :disabled="index === profile.experience.length - 1" @click="move('experience', index, 1)">↓</button><button type="button" class="danger" @click="remove('experience', index)">×</button></div></div>
              <div class="editor-grid">
                <label class="editor-field editor-field-wide"><span>Role</span><input :value="job.role" type="text" @input="updateItem('experience', index, 'role', $event.target.value)" /></label>
                <label class="editor-field editor-field-wide"><span>Company</span><input :value="job.company" type="text" @input="updateItem('experience', index, 'company', $event.target.value)" /></label>
                <label class="editor-field"><span>Period</span><input :value="job.period" type="text" placeholder="2024 — Present" @input="updateItem('experience', index, 'period', $event.target.value)" /></label>
                <label class="editor-field"><span>Location</span><input :value="job.location" type="text" @input="updateItem('experience', index, 'location', $event.target.value)" /></label>
                <label class="editor-field editor-field-wide"><span>Achievements · one per line</span><textarea :value="(job.bullets || []).join('\n')" rows="6" @input="updateItem('experience', index, 'bullets', lines($event.target.value))"></textarea></label>
              </div>
            </article>
          </div>
          <button class="builder-add" type="button" @click="$emit('add-item', { section: 'experience' })">+ Add experience</button>
        </section>

        <section v-else-if="activeTab === 'projects'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>04</span><h3>Selected projects</h3></div>
            <p>Project covers automatically flow into Case Study, Bento and other visual concepts.</p>
          </div>
          <div class="builder-list">
            <article v-for="(project, index) in profile.projects" :key="`project-${index}`" class="builder-card">
              <div class="builder-card-top"><strong>{{ project.name || `Project ${index + 1}` }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('projects', index, -1)">↑</button><button type="button" :disabled="index === profile.projects.length - 1" @click="move('projects', index, 1)">↓</button><button type="button" class="danger" @click="remove('projects', index)">×</button></div></div>
              <div class="project-cover-preview" :class="{ empty: !project.image }" :style="coverStyle(project.image)"><span v-if="!project.image">Optional cover image</span></div>
              <div class="editor-grid">
                <label class="editor-field editor-field-wide"><span>Project name</span><input :value="project.name" type="text" @input="updateItem('projects', index, 'name', $event.target.value)" /></label>
                <label class="editor-field"><span>Type / tags</span><input :value="project.type" type="text" placeholder="AI · Design Ops" @input="updateItem('projects', index, 'type', $event.target.value)" /></label>
                <label class="editor-field"><span>Impact</span><input :value="project.impact" type="text" placeholder="40% faster review" @input="updateItem('projects', index, 'impact', $event.target.value)" /></label>
                <label class="editor-field editor-field-wide"><span>Cover image URL</span><input :value="project.image || ''" type="url" placeholder="https://.../project-cover.jpg" @input="updateItem('projects', index, 'image', $event.target.value)" /><small>Leave blank to use the generated visual fallback.</small></label>
                <label class="editor-field editor-field-wide"><span>Description</span><textarea :value="project.description" rows="5" @input="updateItem('projects', index, 'description', $event.target.value)"></textarea></label>
              </div>
            </article>
          </div>
          <button class="builder-add" type="button" @click="$emit('add-item', { section: 'projects' })">+ Add project</button>
        </section>

        <section v-else class="editor-section">
          <div class="editor-section-heading">
            <div><span>05</span><h3>Skills & languages</h3></div>
            <p>Use concise keywords for recruiter scanning and ATS matching.</p>
          </div>
          <label class="editor-field editor-field-wide"><span>Skills · one per line or comma separated</span><textarea :value="profile.skills.join('\n')" rows="10" @input="updateArray('skills', tokenList($event.target.value))"></textarea><small>{{ profile.skills.length }} skills</small></label>
          <div class="skill-preview"><span v-for="skill in profile.skills" :key="skill">{{ skill }}</span></div>
          <label class="editor-field editor-field-wide editor-language-field"><span>Languages · one per line</span><textarea :value="profile.languages.join('\n')" rows="5" @input="updateArray('languages', lines($event.target.value))"></textarea></label>
        </section>
      </div>

      <footer class="editor-footer">
        <button type="button" class="editor-reset" @click="$emit('reset')">Reset demo data</button>
        <div class="editor-footer-meta"><span>Auto-saved locally</span><button type="button" class="editor-done" @click="$emit('close')">Done editing</button></div>
      </footer>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'ProfileEditor',
  props: { open: { type: Boolean, default: false }, profile: { type: Object, required: true } },
  emits: ['close', 'update-field', 'update-item', 'update-array', 'add-item', 'remove-item', 'move-item', 'reset'],
  data() {
    return {
      activeTab: 'profile',
      tabs: [
        { id: 'profile', label: 'Profile', icon: '◉' },
        { id: 'impact', label: 'Impact', icon: '↗' },
        { id: 'experience', label: 'Experience', icon: '▤' },
        { id: 'projects', label: 'Projects', icon: '◇' },
        { id: 'skills', label: 'Skills', icon: '⌘' },
      ],
    }
  },
  methods: {
    update(key, value) { this.$emit('update-field', { key, value }) },
    updateItem(section, index, key, value) { this.$emit('update-item', { section, index, key, value }) },
    updateArray(key, value) { this.$emit('update-array', { key, value }) },
    remove(section, index) { this.$emit('remove-item', { section, index }) },
    move(section, index, direction) { this.$emit('move-item', { section, index, direction }) },
    lines(value) { return value.split(/\n+/).map((item) => item.trim()).filter(Boolean) },
    tokenList(value) { return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) },
    coverStyle(url) { return url ? { backgroundImage: `linear-gradient(rgba(15,23,42,.05), rgba(15,23,42,.05)), url("${url.replace(/"/g, '%22')}")` } : {} },
  },
}
</script>
