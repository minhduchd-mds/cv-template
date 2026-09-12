<template>
  <aside class="profile-editor" :class="{ open }" aria-label="CV profile editor">
    <div class="editor-backdrop" @click="$emit('close')"></div>
    <div class="editor-panel">
      <header class="editor-header">
        <div>
          <span class="editor-kicker">Profile editor</span>
          <h2>Edit once. Update every template.</h2>
        </div>
        <button type="button" class="editor-close" aria-label="Close profile editor" @click="$emit('close')">×</button>
      </header>

      <div class="editor-body">
        <div class="editor-grid">
          <label class="editor-field editor-field-wide">
            <span>Full name</span>
            <input :value="profile.name" type="text" @input="update('name', $event.target.value)" />
          </label>

          <label class="editor-field editor-field-wide">
            <span>Role / headline</span>
            <input :value="profile.role" type="text" @input="update('role', $event.target.value)" />
          </label>

          <label class="editor-field editor-field-wide">
            <span>Location</span>
            <input :value="profile.location" type="text" @input="update('location', $event.target.value)" />
          </label>

          <label class="editor-field">
            <span>Email</span>
            <input :value="profile.email" type="email" @input="update('email', $event.target.value)" />
          </label>

          <label class="editor-field">
            <span>Phone</span>
            <input :value="profile.phone" type="text" @input="update('phone', $event.target.value)" />
          </label>

          <label class="editor-field editor-field-wide">
            <span>Website / portfolio</span>
            <input :value="profile.website" type="text" @input="update('website', $event.target.value)" />
          </label>

          <label class="editor-field editor-field-wide">
            <span>Professional summary</span>
            <textarea :value="profile.summary" rows="7" @input="update('summary', $event.target.value)"></textarea>
            <small>{{ profile.summary.length }} characters</small>
          </label>
        </div>

        <div class="editor-note">
          <strong>Shared profile data</strong>
          <p>Changes here update all six CV templates immediately. Experience, projects, skills and education remain structured in <code>src/data/cv.js</code> for now.</p>
        </div>
      </div>

      <footer class="editor-footer">
        <button type="button" class="editor-reset" @click="$emit('reset')">Reset demo data</button>
        <button type="button" class="editor-done" @click="$emit('close')">Done editing</button>
      </footer>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'ProfileEditor',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    profile: {
      type: Object,
      required: true,
    },
  },
  emits: ['close', 'update-field', 'reset'],
  methods: {
    update(key, value) {
      this.$emit('update-field', { key, value })
    },
  },
}
</script>
