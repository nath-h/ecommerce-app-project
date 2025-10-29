<template>
  <div v-if="show" class="email-modal-overlay" @click="handleOverlayClick">
    <div class="email-modal">
      <h3>Verify Your Order</h3>
      <p>
        Please enter the email address you used when placing this order, or the email address
        associated with your account if you were logged in when placing it:
      </p>
      <form @submit.prevent="handleSubmit">
        <input
          v-model="emailInput"
          type="email"
          placeholder="Enter your email"
          required
          class="email-input"
          ref="emailInputRef"
          :disabled="loading"
        />
        <div class="modal-actions">
          <button type="button" @click="handleCancel" class="btn btn-secondary" :disabled="loading">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!emailInput.trim() || loading">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>
        </div>
      </form>
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['verify', 'cancel', 'close'])

const emailInput = ref('')
const emailInputRef = ref(null)

watch(
  () => props.show,
  async (newValue) => {
    if (newValue) {
      emailInput.value = ''
      await nextTick()
      emailInputRef.value?.focus()
    }
  },
)

const handleSubmit = () => {
  if (emailInput.value.trim()) {
    emit('verify', emailInput.value.trim())
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<style scoped>
.email-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.email-modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.email-modal h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 24px;
}

.email-modal p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
}

.email-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 16px;
  box-sizing: border-box;
}

.email-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.email-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-actions .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #369870;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  color: #dc3545;
  margin-top: 10px;
  padding: 8px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
}
</style>
