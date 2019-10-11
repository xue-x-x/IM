import Vue from 'vue'
import Router from 'vue-router'
import UserBox from '../views/im/layout/userBox.vue';
import ChatBox from '../views/im/layout/chatBox.vue';
import ChatGroupBox from '../views/im/layout/chatGroupBox.vue';
import organization from '../views/im/layout/organization.vue';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: require('@/views/login.vue').default
    },
    {
      path: '/index',
      name: 'landing-page',
      component: require('@/views/index.vue').default,
      children: [
        {
          path: 'chatBox',
          name: 'chatBox',
          component: ChatBox
        },
        {
          path: '/',
          name: 'userIndex',
          component: UserBox
        },
        {
          path: 'userBox',
          name: 'userBox',
          component: UserBox
        },
        {
          path: 'chatGroupBox',
          name: 'chatGroupBox',
          component: ChatGroupBox
        },
        {
          path: 'organization',
          name: 'organization',
          component: organization
        }
      ]
    },
  ]
})
