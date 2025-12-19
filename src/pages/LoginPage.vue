<template>
  <q-page class="flex flex-center">
    <q-card style="width: 360px">
      <q-card-section>
        <div class="text-h6 text-center">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="email"
          label="Email"
          type="email"
          filled
          class="q-mb-md"
        />

        <q-input
          v-model="password"
          label="Password"
          type="password"
          filled
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Accedi"
          color="primary"
          :loading="loading"
          @click="login"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

// 🔹 LOGIN
const login = async () => {
  loading.value = true

  try {
    // 1️⃣ Login
    const res = await axios.post('http://localhost:8000/auth/login', {
      email: email.value,
      password: password.value
    })

    const token = res.data.access_token
    localStorage.setItem('token', token)

    // 2️⃣ Decode JWT
    const payload = JSON.parse(atob(token.split('.')[1]))
    const role = payload.role
    const userId = payload.sub || payload.user_id || null

    if (!userId) throw new Error('ID utente mancante nel token')

    // 3️⃣ Salva role e userId
    localStorage.setItem('role', role)
    localStorage.setItem('userId', userId)

    // 4️⃣ Redirect automatico
    if (role === 'dipendente') {
      router.push('/dipendente/dashboard')
    } else {
      router.push('/segreteria/dashboard')
    }

  } catch (err) {
    console.error(err)
    alert('Email o password errate')
    localStorage.clear()
  } finally {
    loading.value = false
  }
}

// 🔹 AUTO LOGIN
onMounted(() => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (token && role) {
    try {
      // Redirect automatico
      if (role === 'dipendente') {
        router.push('/dipendente/dashboard')
      } else {
        router.push('/segreteria/dashboard')
      }
    } catch {
      localStorage.clear()
    }
  }
})
</script>
