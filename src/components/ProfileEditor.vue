<template>
  <aside class="profile-editor" :class="{ open }" aria-label="CV profile editor">
    <div class="editor-backdrop" @click="$emit('close')"></div>
    <div class="editor-panel">
      <header class="editor-header">
        <div class="editor-header-copy">
          <span class="editor-kicker">CV Builder</span>
          <h2>Edit once. Update every CV and web concept.</h2>
          <div class="editor-progress" role="progressbar" aria-label="CV completeness" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="completion">
            <div class="editor-progress-meta">
              <span>CV completeness</span>
              <strong>{{ completion }}%</strong>
            </div>
            <span class="editor-progress-track"><span :style="{ width: `${completion}%` }"></span></span>
          </div>
        </div>
        <button type="button" class="editor-close" aria-label="Close CV builder" @click="$emit('close')">×</button>
      </header>

      <div class="editor-workspace">
        <nav class="editor-tabs" aria-label="CV builder sections">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="{ active: activeTab === tab.id }"
            :aria-label="`${tab.label} · ${tab.hint}`"
            :aria-pressed="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            <span class="editor-tab-icon">{{ tab.icon }}</span>
            <span class="editor-tab-copy"><strong>{{ tab.label }}</strong><small>{{ tab.hint }}</small></span>
          </button>
        </nav>

        <div class="editor-body">
        <p v-if="imageError" class="editor-error" role="alert">{{ imageError }}</p>

        <section v-if="!['design','layout'].includes(activeTab)" class="vue-content-health" :class="{ collapsed: !healthOpen }">
          <header>
            <div><span>Content intelligence</span><strong>Content Health</strong><small>{{ contentHealthMeta.clear }}/{{ contentHealthMeta.total }} checks clear · {{ contentHealthMeta.warnings }} action{{ contentHealthMeta.warnings === 1 ? '' : 's' }} needed</small></div>
            <button type="button" :aria-expanded="String(healthOpen)" @click="healthOpen = !healthOpen">{{ healthOpen ? 'Hide' : 'Show' }}</button>
          </header>
          <template v-if="healthOpen">
            <div class="vue-content-health-groups">
              <span><strong>Readability</strong><small>{{ contentHealthFindings.filter((item) => item.group === 'Readability').length || 'Clear' }}</small></span>
              <span><strong>Evidence</strong><small>{{ contentHealthFindings.filter((item) => item.group === 'Evidence').length || 'Clear' }}</small></span>
              <span><strong>Template coverage</strong><small>{{ contentHealthFindings.filter((item) => item.group === 'Template coverage').length || 'Clear' }}</small></span>
            </div>
            <div v-if="contentHealthFindings.length" class="vue-content-health-list">
              <article v-for="item in contentHealthFindings" :key="item.id" :class="['vue-health-item', item.level]">
                <i aria-hidden="true"></i>
                <div><span>{{ item.group }}</span><strong>{{ item.title }}</strong><p>{{ item.detail }}</p></div>
                <button type="button" @click="handleHealthAction(item)">{{ healthActionLabel(item) }}</button>
              </article>
            </div>
            <div v-else class="vue-health-clear"><strong>No content issues detected</strong><p>Current length, evidence and template coverage look clean.</p></div>
          </template>
        </section>

        <section v-if="activeTab === 'profile'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>01</span><h3>Profile & contact</h3></div>
            <p>Core information shared by every template and landing concept.</p>
          </div>

          <div class="avatar-builder">
            <div
              class="avatar-preview"
              :class="[{ empty: !profile.avatar, dragging: avatarDragging }, avatarShapeClass]"
              @pointerdown="startAvatarDrag"
              @pointermove="moveAvatarDrag"
              @pointerup="endAvatarDrag"
              @pointercancel="endAvatarDrag"
            >
              <img v-if="profile.avatar" :src="profile.avatar" :alt="avatarAlt" :style="avatarImageStyle" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <strong>Profile photo</strong>
              <p>Upload JPG, PNG or WebP. The image is compressed locally before it is saved.</p>
              <small v-if="!fieldSupported('avatar')" class="template-field-note">Saved globally · {{ template?.name }} does not display an avatar.</small>
              <div class="image-actions">
                <label class="image-upload-button">
                  <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadAvatar" />
                  Upload photo
                </label>
                <button v-if="profile.avatar" type="button" class="image-clear" @click="update('avatar', '')">Remove</button>
              </div>
            </div>
          </div>

          <div v-if="profile.avatar" class="avatar-framing-control">
            <div class="avatar-framing-head">
              <div><strong>Avatar framing</strong><span>Shape and focal point are shared across every template.</span></div>
              <button type="button" @click="resetAvatarFraming">Reset</button>
            </div>
            <div class="avatar-shape-segmented" role="group" aria-label="Avatar shape">
              <button
                v-for="shape in avatarShapes"
                :key="shape.id"
                type="button"
                :class="{ active: avatarShape === shape.id }"
                :aria-pressed="avatarShape === shape.id"
                @click="$emit('update-appearance', { key: 'avatarShape', value: shape.id })"
              >
                {{ shape.label }}
              </button>
            </div>
            <div class="avatar-size-control">
              <span>Avatar size</span>
              <div class="avatar-size-segmented" role="group" aria-label="Avatar size">
                <button
                  v-for="size in avatarSizes"
                  :key="size.id"
                  type="button"
                  :class="{ active: avatarSize === size.id }"
                  :aria-pressed="avatarSize === size.id"
                  @click="$emit('update-appearance', { key: 'avatarSize', value: size.id })"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>
            <div class="avatar-position-grid">
              <label class="editor-field">
                <span>Horizontal · {{ avatarX }}%</span>
                <input type="range" min="0" max="100" :value="avatarX" @input="$emit('update-appearance', { key: 'avatarX', value: Number($event.target.value) })" />
              </label>
              <label class="editor-field">
                <span>Vertical · {{ avatarY }}%</span>
                <input type="range" min="0" max="100" :value="avatarY" @input="$emit('update-appearance', { key: 'avatarY', value: Number($event.target.value) })" />
              </label>
              <label class="editor-field">
                <span>Zoom · {{ Math.round(avatarZoom * 100) }}%</span>
                <input type="range" min="100" max="250" :value="Math.round(avatarZoom * 100)" @input="$emit('update-appearance', { key: 'avatarZoom', value: Number($event.target.value) / 100 })" />
              </label>
              <label class="editor-field">
                <span>Rotate · {{ avatarRotate }}°</span>
                <input type="range" min="-180" max="180" :value="avatarRotate" @input="$emit('update-appearance', { key: 'avatarRotate', value: Number($event.target.value) })" />
              </label>
            </div>
          </div>

          <div class="editor-grid">
            <label class="editor-field editor-field-wide"><span>Full name</span><input :value="profile.name" type="text" @input="update('name', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Role / title</span><input :value="profile.role" type="text" @input="update('role', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide" :class="{ 'field-not-used': !fieldSupported('headline') }"><span>Headline / tagline <small v-if="!fieldSupported('headline')">Not used by {{ template?.name }}</small></span><input data-profile-field="headline" :value="profile.headline || ''" type="text" @input="update('headline', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Location</span><input :value="profile.location" type="text" @input="update('location', $event.target.value)" /></label>
            <label class="editor-field"><span>Email</span><input :value="profile.email" type="email" @input="update('email', $event.target.value)" /></label>
            <label class="editor-field"><span>Phone</span><input :value="profile.phone" type="text" @input="update('phone', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Website / portfolio</span><input :value="profile.website" type="text" @input="update('website', $event.target.value)" /></label>
            <label class="editor-field editor-field-wide"><span>Professional summary</span><textarea data-profile-field="summary" :value="profile.summary" rows="7" @input="update('summary', $event.target.value)"></textarea><small>{{ profile.summary.length }} characters</small></label>
            <label class="editor-field editor-field-wide" :class="{ 'field-not-used': !fieldSupported('quote') }"><span>Personal quote / statement <small v-if="!fieldSupported('quote')">Not used by {{ template?.name }}</small></span><textarea data-profile-field="quote" :value="profile.quote || ''" rows="3" @input="update('quote', $event.target.value)"></textarea><small>{{ fieldSupported('quote') ? 'Rendered by the selected template.' : 'Saved globally and available when you switch to a template that supports quotes.' }}</small></label>
          </div>
        </section>

        <section v-else-if="activeTab === 'impact'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>02</span><h3>Impact metrics</h3></div>
            <p>Use concrete numbers. Bento, Executive and Product templates surface these prominently.</p>
          </div>
          <div class="builder-list">
            <article v-for="(item, index) in profile.highlights" :key="item.id || `highlight-${index}`" class="builder-card builder-card-compact">
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
            <article v-for="(job, index) in profile.experience" :key="job.id || `experience-${index}`" class="builder-card">
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
            <p>Upload project covers directly. They flow into Case Study, Bento and visual CV concepts automatically.</p>
          </div>

          <div class="builder-list">
            <article v-for="(project, index) in profile.projects" :key="project.id || `project-${index}`" class="builder-card">
              <div class="builder-card-top"><strong>{{ project.name || `Project ${index + 1}` }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('projects', index, -1)">↑</button><button type="button" :disabled="index === profile.projects.length - 1" @click="move('projects', index, 1)">↓</button><button type="button" class="danger" @click="remove('projects', index)">×</button></div></div>
              <div class="project-cover-preview" :class="{ empty: !project.image }" :style="imageStyle(project.image)"><span v-if="!project.image">Project cover</span></div>
              <small v-if="!fieldSupported('projectImages')" class="template-field-note project-cover-note">Cover stays saved, but {{ template?.name }} does not render project images.</small>
              <div class="project-upload-row">
                <label class="image-upload-button compact"><input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadProjectImage(index, $event)" />Upload cover</label>
                <button v-if="project.image" type="button" class="image-clear" @click="updateItem('projects', index, 'image', '')">Remove image</button>
              </div>
              <div class="editor-grid">
                <label class="editor-field editor-field-wide"><span>Project name</span><input :value="project.name" type="text" @input="updateItem('projects', index, 'name', $event.target.value)" /></label>
                <label class="editor-field"><span>Type / tags</span><input :value="project.type" type="text" placeholder="AI · Design Ops" @input="updateItem('projects', index, 'type', $event.target.value)" /></label>
                <label class="editor-field"><span>Impact</span><input :value="project.impact" type="text" placeholder="40% faster review" @input="updateItem('projects', index, 'impact', $event.target.value)" /></label>
                <label class="editor-field editor-field-wide"><span>Optional external cover URL</span><input :value="externalImageValue(project.image)" type="url" placeholder="https://.../project-cover.jpg" @input="updateItem('projects', index, 'image', $event.target.value)" /><small>Direct uploads are stored locally in the browser. URL remains useful for a shareable profile.</small></label>
                <label class="editor-field editor-field-wide"><span>Description</span><textarea :value="project.description" rows="5" @input="updateItem('projects', index, 'description', $event.target.value)"></textarea></label>
              </div>
            </article>
          </div>
          <button class="builder-add" type="button" @click="$emit('add-item', { section: 'projects' })">+ Add project</button>
        </section>

        <section v-else-if="activeTab === 'education'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>05</span><h3>Education & certificates</h3></div>
            <p>Keep formal education and professional credentials structured separately.</p>
          </div>

          <div class="builder-subheading"><strong>Education</strong><button class="builder-add-inline" type="button" @click="$emit('add-item', { section: 'education' })">+ Add</button></div>
          <div class="builder-list">
            <article v-for="(item, index) in profile.education" :key="item.id || `education-${index}`" class="builder-card builder-card-compact">
              <div class="builder-card-top"><strong>{{ item.title || `Education ${index + 1}` }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('education', index, -1)">↑</button><button type="button" :disabled="index === profile.education.length - 1" @click="move('education', index, 1)">↓</button><button type="button" class="danger" @click="remove('education', index)">×</button></div></div>
              <div class="editor-grid"><label class="editor-field editor-field-wide"><span>Program / degree</span><input :value="item.title" type="text" @input="updateItem('education', index, 'title', $event.target.value)" /></label><label class="editor-field"><span>School / institution</span><input :value="item.place" type="text" @input="updateItem('education', index, 'place', $event.target.value)" /></label><label class="editor-field"><span>Period</span><input :value="item.period" type="text" @input="updateItem('education', index, 'period', $event.target.value)" /></label></div>
            </article>
          </div>

          <div class="builder-subheading certificates-heading"><strong>Certificates</strong><button class="builder-add-inline" type="button" @click="$emit('add-item', { section: 'certificates' })">+ Add</button></div>
          <div class="builder-list">
            <article v-for="(item, index) in profile.certificates" :key="item.id || `certificate-${index}`" class="builder-card builder-card-compact">
              <div class="builder-card-top"><strong>{{ item.title || `Certificate ${index + 1}` }}</strong><div class="builder-actions"><button type="button" :disabled="index === 0" @click="move('certificates', index, -1)">↑</button><button type="button" :disabled="index === profile.certificates.length - 1" @click="move('certificates', index, 1)">↓</button><button type="button" class="danger" @click="remove('certificates', index)">×</button></div></div>
              <div class="editor-grid"><label class="editor-field editor-field-wide"><span>Certificate</span><input :value="item.title" type="text" @input="updateItem('certificates', index, 'title', $event.target.value)" /></label><label class="editor-field"><span>Issuer</span><input :value="item.issuer" type="text" @input="updateItem('certificates', index, 'issuer', $event.target.value)" /></label><label class="editor-field"><span>Year / period</span><input :value="item.period" type="text" @input="updateItem('certificates', index, 'period', $event.target.value)" /></label><label class="editor-field editor-field-wide"><span>Credential URL</span><input :value="item.url || ''" type="url" @input="updateItem('certificates', index, 'url', $event.target.value)" /></label></div>
            </article>
          </div>
        </section>

        <section v-else-if="activeTab === 'skills'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>06</span><h3>Skills & languages</h3></div>
            <p>Use concise keywords for recruiter scanning and ATS matching.</p>
          </div>
          <label class="editor-field editor-field-wide"><span>Skills · one per line or comma separated</span><textarea :value="profile.skills.join('\n')" rows="10" @input="updateArray('skills', tokenList($event.target.value))"></textarea><small>{{ profile.skills.length }} skills</small></label>
          <div class="skill-preview"><span v-for="(skill, skillIndex) in profile.skills" :key="skillIndex">{{ skill }}</span></div>
          <label class="editor-field editor-field-wide editor-language-field"><span>Languages · one per line</span><textarea :value="profile.languages.join('\n')" rows="5" @input="updateArray('languages', lines($event.target.value))"></textarea></label>
        </section>

        <section v-else-if="activeTab === 'design'" class="editor-section">
          <div class="editor-section-heading">
            <div><span>07</span><h3>Visual design</h3></div>
            <p>Template-aware controls: typography, scale, spacing and project presentation.</p>
          </div>

          <div class="design-context-card">
            <span>{{ templateMeta.label }}</span>
            <strong>{{ template?.name || 'Selected template' }}</strong>
            <p>{{ templateMeta.structure }}</p>
          </div>

          <div class="design-section-label"><span>Typography</span><small>Global type controls</small></div>
          <div class="editor-grid">
            <label class="editor-field">
              <span>Accent color</span>
              <input :value="accent" type="color" aria-label="CV accent color" @input="$emit('update-accent', $event.target.value)" />
            </label>
            <label class="editor-field">
              <span>Font family</span>
              <select :value="appearance.font" @change="$emit('update-appearance', { key: 'font', value: $event.target.value })">
                <option value="sans">Sans · Modern</option>
                <option value="serif">Serif · Classic</option>
                <option value="mono">Mono · Technical</option>
              </select>
            </label>
          </div>

          <div class="design-range-grid">
            <label class="editor-field">
              <span class="range-head"><span>Text size</span><output>{{ textScalePercent }}%</output></span>
              <input type="range" min="90" max="115" step="5" :value="textScalePercent" @input="$emit('update-appearance', { key: 'textScale', value: Number($event.target.value) / 100 })" />
            </label>
            <label class="editor-field">
              <span class="range-head"><span>Heading size</span><output>{{ headingScalePercent }}%</output></span>
              <input type="range" min="90" max="120" step="5" :value="headingScalePercent" @input="$emit('update-appearance', { key: 'headingScale', value: Number($event.target.value) / 100 })" />
            </label>
          </div>

          <div class="design-section-label"><span>Spacing & shape</span><small>Keep A4 readable</small></div>
          <div class="editor-grid">
            <label class="editor-field">
              <span>Content density</span>
              <select :value="appearance.density" @change="$emit('update-appearance', { key: 'density', value: $event.target.value })">
                <option value="compact">Compact</option>
                <option value="balanced">Balanced</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
            <label class="editor-field">
              <span>Section spacing</span>
              <select :value="appearance.sectionSpacing || 'balanced'" @change="$emit('update-appearance', { key: 'sectionSpacing', value: $event.target.value })">
                <option value="compact">Tight</option>
                <option value="balanced">Balanced</option>
                <option value="airy">Airy</option>
              </select>
            </label>
            <label class="editor-field editor-field-wide">
              <span>Corner style</span>
              <select :value="appearance.radius" @change="$emit('update-appearance', { key: 'radius', value: $event.target.value })">
                <option value="sharp">Sharp</option>
                <option value="soft">Soft</option>
                <option value="round">Rounded</option>
              </select>
            </label>
          </div>

          <div class="project-layout-control" :class="{ disabled: !templateMeta.projects }" aria-label="Project display">
            <div>
              <strong>Project display</strong>
              <span>{{ templateMeta.projects ? 'Switch project sections between visual cards and a compact list.' : 'This template does not use a project section in its primary composition.' }}</span>
            </div>
            <div class="project-layout-segmented" role="group" aria-label="Project layout">
              <button type="button" :disabled="!templateMeta.projects" :class="{ active: (appearance.projectLayout || 'cards') === 'cards' }" :aria-pressed="(appearance.projectLayout || 'cards') === 'cards'" @click="$emit('update-appearance', { key: 'projectLayout', value: 'cards' })">
                <span class="layout-preview-icon cards-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Card
              </button>
              <button type="button" :disabled="!templateMeta.projects" :class="{ active: appearance.projectLayout === 'list' }" :aria-pressed="appearance.projectLayout === 'list'" @click="$emit('update-appearance', { key: 'projectLayout', value: 'list' })">
                <span class="layout-preview-icon list-icon" aria-hidden="true"><i></i><i></i><i></i></span>List
              </button>
            </div>
          </div>

          <div class="design-section-label"><span>Style presets</span><small>Visual direction, not job role</small></div>
          <div class="design-presets design-style-grid">
            <button type="button" @click="applyDesignPreset('classic')"><i class="preset-swatch classic"></i><strong>Classic</strong><span>Serif · balanced</span></button>
            <button type="button" @click="applyDesignPreset('modern')"><i class="preset-swatch modern"></i><strong>Modern</strong><span>Sans · balanced</span></button>
            <button type="button" @click="applyDesignPreset('editorial')"><i class="preset-swatch editorial"></i><strong>Editorial</strong><span>Serif · airy</span></button>
            <button type="button" @click="applyDesignPreset('technical')"><i class="preset-swatch technical"></i><strong>Technical</strong><span>Mono · compact</span></button>
            <button type="button" @click="applyDesignPreset('portfolio')"><i class="preset-swatch portfolio"></i><strong>Portfolio</strong><span>Larger · visual</span></button>
            <button type="button" @click="applyDesignPreset('compact')"><i class="preset-swatch compact"></i><strong>Compact</strong><span>Small · ATS-safe</span></button>
          </div>

          <div class="editor-note"><strong>Structure stays template-specific</strong><p>Each CV owns its composition. Global controls only tune typography and rhythm; project controls appear only where that template actually renders projects.</p></div>
        </section>

        <section v-else class="editor-section">
          <div class="editor-section-heading">
            <div><span>08</span><h3>Section layout</h3></div>
            <p>Visibility follows the selected template. Only flexible templates allow section reordering, and only within the same content group.</p>
          </div>
          <div class="layout-contract-summary"><div><span>{{ layoutModeLabel }}</span><strong>{{ template?.name || 'Template' }}</strong><small>{{ layoutContract.label }} · {{ layoutContract.page }}</small></div><p>{{ layoutContract.mode === 'flexible' ? 'Reorder only inside Main or Side groups.' : 'Hierarchy is locked to protect this composition.' }}</p></div>
          <div class="layout-list">
            <article
              v-for="(section, index) in profile.sections"
              :key="section.id"
              class="layout-item"
              :class="{ dragging: dragIndex === index, disabled: !section.enabled, unsupported: !sectionSupport(section.id).supported }"
              :draggable="sectionReorderable(section.id)"
              @dragstart="startDrag(index)"
              @dragend="dragIndex = null"
              @dragover.prevent
              @drop="dropSection(index)"
            >
              <span class="drag-handle" aria-hidden="true">{{ sectionReorderable(section.id) ? '⋮⋮' : '•' }}</span>
              <div><strong>{{ section.label }}</strong><small>{{ sectionMeta(section.id) }}</small></div>
              <div class="layout-actions">
                <template v-if="sectionReorderable(section.id)">
                  <button type="button" :disabled="!canMoveSection(index, -1)" aria-label="Move section up" @click="moveSection(index, -1)">↑</button>
                  <button type="button" :disabled="!canMoveSection(index, 1)" aria-label="Move section down" @click="moveSection(index, 1)">↓</button>
                </template>
                <span v-else class="layout-lock">{{ sectionSupport(section.id).supported ? 'Locked' : 'Unavailable' }}</span>
                <label v-if="sectionSupport(section.id).supported" class="section-toggle"><input type="checkbox" :checked="sectionVisible(section.id)" @change="toggleSection(section.id, $event.target.checked)" /><span></span></label>
              </div>
            </article>
          </div>
          <div class="editor-note"><strong>Template-aware ordering</strong><p>Each template keeps its core visual structure. Your order is respected within the main and sidebar flows, while disabled sections are hidden everywhere.</p></div>
        </section>
        </div>
      </div>

      <footer class="editor-footer">
        <button type="button" class="editor-reset" @click="$emit('reset')">Reset demo data</button>
        <div class="editor-footer-meta"><span>Auto-saved locally</span><button type="button" class="editor-done" @click="$emit('close')">Done editing</button></div>
      </footer>
    </div>
  </aside>
</template>

<script>
import { getTemplateFieldConfig, getTemplateLayoutContract, getTemplateSectionConfig, isTemplateSectionVisible, sameTemplateSectionGroup } from '../data/template-layout-contracts'
import { analyzeContentHealth, contentHealthSummary } from '../data/content-health'

const MAX_FILE_BYTES = 10 * 1024 * 1024

export default {
  name: 'ProfileEditor',
  props: {
    open: { type: Boolean, default: false },
    profile: { type: Object, required: true },
    completion: { type: Number, default: 0 },
    appearance: {
      type: Object,
      default: () => ({ font: 'sans', density: 'balanced', radius: 'soft', projectLayout: 'cards', textScale: 1, headingScale: 1, sectionSpacing: 'balanced', avatarShape: 'circle', avatarSize: 'medium', avatarX: 50, avatarY: 50, avatarZoom: 1, avatarRotate: 0 }),
    },
    accent: { type: String, default: '#6d5dfc' },
    template: { type: Object, default: null },
    requestedTab: { type: String, default: 'profile' },
    requestedField: { type: String, default: '' },
  },
  emits: ['close', 'update-field', 'update-item', 'update-array', 'add-item', 'remove-item', 'move-item', 'update-appearance', 'update-accent', 'reset'],
  data() {
    return {
      activeTab: 'profile',
      imageError: '',
      dragIndex: null,
      avatarDragging: false,
      avatarDragStart: null,
      healthOpen: true,
      avatarShapes: [
        { id: 'circle', label: 'Circle' },
        { id: 'rounded', label: 'Rounded' },
        { id: 'square', label: 'Square' },
      ],
      avatarSizes: [
        { id: 'small', label: 'S' },
        { id: 'medium', label: 'M' },
        { id: 'large', label: 'L' },
      ],
      tabs: [
        { id: 'profile', label: 'Profile', hint: 'Identity & contact', icon: '01' },
        { id: 'impact', label: 'Impact', hint: 'Metrics & outcomes', icon: '02' },
        { id: 'experience', label: 'Experience', hint: 'Roles & achievements', icon: '03' },
        { id: 'projects', label: 'Projects', hint: 'Selected work', icon: '04' },
        { id: 'education', label: 'Education', hint: 'Study & credentials', icon: '05' },
        { id: 'skills', label: 'Skills', hint: 'Keywords & languages', icon: '06' },
        { id: 'design', label: 'Design', hint: 'Type, scale & layout', icon: '07' },
        { id: 'layout', label: 'Layout', hint: 'Order & visibility', icon: '08' },
      ],
    }
  },
  computed: {
    contentHealthFindings() { return analyzeContentHealth(this.profile, this.template?.id) },
    contentHealthMeta() { return contentHealthSummary(this.contentHealthFindings) },
    layoutContract() { return getTemplateLayoutContract(this.template?.id) },
    layoutModeLabel() { return this.layoutContract.mode === 'fixed' ? 'Fixed hierarchy' : this.layoutContract.mode === 'guided' ? 'Guided hierarchy' : 'Flexible hierarchy' },
    initials() {
      return String(this.profile.name || 'CV').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
    },
    avatarAlt() {
      const name = String(this.profile.name || '').trim()
      return name ? `${name} profile photo` : 'Profile photo'
    },
    avatarShape() {
      return ['circle', 'rounded', 'square'].includes(this.appearance.avatarShape) ? this.appearance.avatarShape : 'circle'
    },
    avatarSize() {
      return ['small', 'medium', 'large'].includes(this.appearance.avatarSize) ? this.appearance.avatarSize : 'medium'
    },
    avatarX() {
      return Number.isFinite(Number(this.appearance.avatarX)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarX))) : 50
    },
    avatarY() {
      return Number.isFinite(Number(this.appearance.avatarY)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarY))) : 50
    },
    avatarZoom() {
      return Number.isFinite(Number(this.appearance.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(this.appearance.avatarZoom))) : 1
    },
    avatarRotate() {
      return Number.isFinite(Number(this.appearance.avatarRotate)) ? Math.min(180, Math.max(-180, Number(this.appearance.avatarRotate))) : 0
    },
    avatarShapeClass() {
      return `avatar-shape-${this.avatarShape}`
    },
    avatarImageStyle() {
      return {
        objectPosition: `${this.avatarX}% ${this.avatarY}%`,
        transform: `scale(${this.avatarZoom}) rotate(${this.avatarRotate}deg)`,
      }
    },
    textScalePercent() {
      const value = Number.isFinite(Number(this.appearance?.textScale)) ? Math.min(1.15, Math.max(.9, Number(this.appearance.textScale))) : 1
      return Math.round(value * 100)
    },
    headingScalePercent() {
      const value = Number.isFinite(Number(this.appearance?.headingScale)) ? Math.min(1.2, Math.max(.9, Number(this.appearance.headingScale))) : 1
      return Math.round(value * 100)
    },
    templateMeta() {
      return {
        label: this.layoutContract.audience || this.template?.category || 'Template',
        structure: this.layoutContract.structure || 'Profile → Experience → Projects → Skills',
        projects: this.sectionSupport('projects').supported !== false,
      }
    },
  },
  watch: {
    requestedTab(value) {
      this.syncRequestedTab(value)
      if (this.open) this.focusRequestedField(this.requestedField)
    },
    requestedField(value) {
      if (this.open) this.focusRequestedField(value)
    },
    open(value) {
      if (value) {
        this.syncRequestedTab(this.requestedTab)
        this.focusRequestedField(this.requestedField)
      }
    },
  },
  methods: {
    fieldSupported(id) { return getTemplateFieldConfig(this.template?.id, id).supported !== false },
    sectionSupport(id) { return getTemplateSectionConfig(this.template?.id, id) },
    sectionVisible(id) { return isTemplateSectionVisible(this.profile, this.template?.id, id) },
    sectionReorderable(id) { return this.layoutContract.mode === 'flexible' && this.sectionSupport(id).supported !== false },
    sectionMeta(id) { const c=this.sectionSupport(id); if(c.supported===false)return 'Not used by this template'; return (c.group==='side'?'Side':'Main')+(c.placement?' · '+c.placement:'')+(c.limit?' · max '+c.limit:'') },
    canMoveSection(index,direction) { const s=this.profile.sections||[]; const a=s[index],b=s[index+direction]; return !!(a&&b&&this.sectionReorderable(a.id)&&this.sectionReorderable(b.id)&&sameTemplateSectionGroup(this.template?.id,a.id,b.id)) },
    healthActionLabel(item) {
      if(item.safeFix==='dedupe-skills')return 'Remove duplicates'
      if(item.safeFix==='show-section')return 'Show section'
      if(item.tab==='projects')return 'Open projects'
      if(item.tab==='experience')return 'Open experience'
      if(item.tab==='impact')return 'Open impact'
      if(item.tab==='education')return 'Open education'
      if(item.tab==='skills')return 'Open skills'
      if(item.tab==='layout')return 'Open layout'
      return 'Review'
    },
    handleHealthAction(item) {
      if(item.safeFix==='dedupe-skills'){
        const seen=new Set()
        const value=(this.profile.skills||[]).filter((skill)=>{
          const key=String(skill||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
          if(!key||seen.has(key))return false
          seen.add(key)
          return true
        })
        this.updateArray('skills',value)
        return
      }
      if(item.safeFix==='show-section'&&item.sectionId){
        this.toggleSection(item.sectionId,true)
        return
      }
      if(item.tab)this.activeTab=item.tab
      if(item.field){
        this.$nextTick(()=>{
          const target=this.$el?.querySelector?.('[data-profile-field="'+item.field+'"]')
          target?.scrollIntoView?.({behavior:'smooth',block:'center'})
          target?.focus?.({preventScroll:true})
        })
      }
    },
    syncRequestedTab(value) {
      if (this.tabs.some((tab) => tab.id === value)) this.activeTab = value
    },
    focusRequestedField(value) {
      if (!['summary', 'headline', 'quote'].includes(value)) return
      this.$nextTick(() => {
        const target = this.$el?.querySelector?.(`[data-profile-field="${value}"]`)
        target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        target?.focus?.({ preventScroll: true })
      })
    },
    update(key, value) { this.$emit('update-field', { key, value }) },
    updateItem(section, index, key, value) { this.$emit('update-item', { section, index, key, value }) },
    updateArray(key, value) { this.$emit('update-array', { key, value }) },
    remove(section, index) { this.$emit('remove-item', { section, index }) },
    move(section, index, direction) { this.$emit('move-item', { section, index, direction }) },
    applyDesignPreset(preset) {
      const presets = {
        classic: { font: 'serif', density: 'balanced', radius: 'soft', sectionSpacing: 'balanced', textScale: 1, headingScale: 1.05, projectLayout: 'list' },
        modern: { font: 'sans', density: 'balanced', radius: 'soft', sectionSpacing: 'balanced', textScale: 1, headingScale: 1, projectLayout: 'cards' },
        editorial: { font: 'serif', density: 'spacious', radius: 'soft', sectionSpacing: 'airy', textScale: 1.05, headingScale: 1.1, projectLayout: 'cards' },
        technical: { font: 'mono', density: 'compact', radius: 'sharp', sectionSpacing: 'compact', textScale: .95, headingScale: 1, projectLayout: 'list' },
        portfolio: { font: 'sans', density: 'spacious', radius: 'round', sectionSpacing: 'airy', textScale: 1.05, headingScale: 1.1, projectLayout: 'cards' },
        compact: { font: 'sans', density: 'compact', radius: 'sharp', sectionSpacing: 'compact', textScale: .9, headingScale: .95, projectLayout: 'list' },
      }
      const config = presets[preset]
      if (!config) return
      Object.entries(config).forEach(([key, value]) => this.$emit('update-appearance', { key, value }))
    },
    lines(value) { return value.split(/\n+/).map((item) => item.trim()).filter(Boolean) },
    tokenList(value) { return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) },
    imageStyle(url) { return url ? { backgroundImage: `linear-gradient(rgba(15,23,42,.04), rgba(15,23,42,.04)), url("${String(url).replace(/"/g, '%22')}")` } : {} },
    resetAvatarFraming() {
      this.$emit('update-appearance', { key: 'avatarShape', value: 'circle' })
      this.$emit('update-appearance', { key: 'avatarSize', value: 'medium' })
      this.$emit('update-appearance', { key: 'avatarX', value: 50 })
      this.$emit('update-appearance', { key: 'avatarY', value: 50 })
      this.$emit('update-appearance', { key: 'avatarZoom', value: 1 })
      this.$emit('update-appearance', { key: 'avatarRotate', value: 0 })
    },
    startAvatarDrag(event) {
      if (!this.profile.avatar || event.button !== 0) return
      const rect = event.currentTarget.getBoundingClientRect()
      this.avatarDragging = true
      this.avatarDragStart = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x: this.avatarX,
        y: this.avatarY,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    },
    moveAvatarDrag(event) {
      if (!this.avatarDragging || !this.avatarDragStart || event.pointerId !== this.avatarDragStart.pointerId) return
      const dx = event.clientX - this.avatarDragStart.clientX
      const dy = event.clientY - this.avatarDragStart.clientY
      const nextX = Math.min(100, Math.max(0, this.avatarDragStart.x - (dx / this.avatarDragStart.width) * 100 / this.avatarZoom))
      const nextY = Math.min(100, Math.max(0, this.avatarDragStart.y - (dy / this.avatarDragStart.height) * 100 / this.avatarZoom))
      this.$emit('update-appearance', { key: 'avatarX', value: Math.round(nextX) })
      this.$emit('update-appearance', { key: 'avatarY', value: Math.round(nextY) })
    },
    endAvatarDrag(event) {
      if (!this.avatarDragging) return
      event.currentTarget?.releasePointerCapture?.(event.pointerId)
      this.avatarDragging = false
      this.avatarDragStart = null
    },
    externalImageValue(value) { return String(value || '').startsWith('data:') ? '' : (value || '') },
    async uploadAvatar(event) {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        const image = await this.compressImage(file, 640, 0.82)
        this.update('avatar', image)
        this.imageError = ''
      } catch (error) {
        this.imageError = error.message || 'Unable to process this image.'
      } finally {
        event.target.value = ''
      }
    },
    async uploadProjectImage(index, event) {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        const image = await this.compressImage(file, 1600, 0.78)
        this.updateItem('projects', index, 'image', image)
        this.imageError = ''
      } catch (error) {
        this.imageError = error.message || 'Unable to process this image.'
      } finally {
        event.target.value = ''
      }
    },
    compressImage(file, maxDimension, quality) {
      if (!file.type.startsWith('image/')) return Promise.reject(new Error('Please choose an image file.'))
      if (file.size > MAX_FILE_BYTES) return Promise.reject(new Error('Image is too large. Please choose a file under 10 MB.'))

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Unable to read this image.'))
        reader.onload = () => {
          const image = new Image()
          image.onerror = () => reject(new Error('This image format could not be decoded.'))
          image.onload = () => {
            const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
            const width = Math.max(1, Math.round(image.naturalWidth * scale))
            const height = Math.max(1, Math.round(image.naturalHeight * scale))
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext('2d')
            if (!context) return reject(new Error('Image processing is not available in this browser.'))
            context.imageSmoothingEnabled = true
            context.imageSmoothingQuality = 'high'
            context.drawImage(image, 0, 0, width, height)
            resolve(canvas.toDataURL('image/webp', quality))
          }
          image.src = reader.result
        }
        reader.readAsDataURL(file)
      })
    },
    toggleSection(id, enabled) {
      if (this.sectionSupport(id).supported === false) return
      const sections = (this.profile.sections || []).map((section) => section.id === id ? { ...section, enabled } : { ...section })
      this.updateArray('sections', sections)
    },
    startDrag(index) { const section=(this.profile.sections||[])[index]; this.dragIndex=section&&this.sectionReorderable(section.id)?index:null },
    dropSection(index) {
      if (this.dragIndex === null || this.dragIndex === index) return
      const sections = (this.profile.sections || []).map((section) => ({ ...section }))
      const source=sections[this.dragIndex], target=sections[index]
      if(!source||!target||!sameTemplateSectionGroup(this.template?.id,source.id,target.id)){ this.dragIndex=null; return }
      const [moved] = sections.splice(this.dragIndex, 1)
      sections.splice(index, 0, moved)
      this.updateArray('sections', sections)
      this.dragIndex = null
    },
    moveSection(index, direction) {
      if(!this.canMoveSection(index,direction))return
      const sections = (this.profile.sections || []).map((section) => ({ ...section }))
      const nextIndex = index + direction
      const [moved] = sections.splice(index, 1)
      sections.splice(nextIndex, 0, moved)
      this.updateArray('sections', sections)
    },
  },
}
</script>
