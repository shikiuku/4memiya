
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use the Service Role Key passed properly
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminUser() {
    const email = 'amemiyadev@4memiya.com'
    const password = '123456'

    // Check if user already exists first maybe?
    // Or just try to create and catch error.

    console.log(`Creating user ${email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirm immediately
        user_metadata: { role: 'admin' }
    })

    if (error) {
        console.error('Error creating user:', error)
        return
    }

    console.log('User created successfully:', data.user.id)
}

createAdminUser()
