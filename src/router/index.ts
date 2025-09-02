import { createRouter, createWebHistory } from 'vue-router'
import { getProjectBySlug } from '@/data/projects'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        // Always scroll to top on route change to a demo or project
        if (to.name === 'project-demo' || to.name === 'project-detail') {
            return { top: 0 }
        }
        return { top: 0 }
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/home.vue'),
            meta: { title: 'Home', requiresAuth: false },
        },
        {
            path: '/projects/:slug',
            name: 'project-detail',
            component: () => import('@/views/ProjectDetail.vue'),
            meta: { title: 'Project', requiresAuth: false },
        },
        {
            path: '/projects/:slug/demo',
            name: 'project-demo',
            component: () => import('@/views/DemoHost.vue'),
            meta: { title: 'Demo', requiresAuth: false, requiresDemo: true },
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('@/views/About.vue'),
            meta: { title: 'About', requiresAuth: false },
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('@/views/Contact.vue'),
            meta: { title: 'Contact', requiresAuth: false },
        },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ],
})
    
    // Navigation guards
    router.beforeEach((to, from, next) => {
        if (to.name === 'project-demo') {
            const slug = to.params.slug as string
            const project = getProjectBySlug(slug)
            if (!project) return next({ path: '/' })
            if (!project.supportsDemo) return next({ name: 'project-detail', params: { slug } })
        }
        next()
    })

export default router
