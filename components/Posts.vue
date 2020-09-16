<template>
<div class="main-container">
    <div class="posts overflow-scroll mb-24">
        <post v-for="(post,index) in posts" :key="index" :post="post" />
    </div>
    <div class="sidebar">
        <img class="sidebar-icon" src="/images/tomo.png">
    　　<div class="sidebar-text">
            <ol class="sidebar-profile">
                <li>Name：永堀　友裕</li>
                <li>E-mail：Bou-zu1997@outlook.jp</li>
                <li>GitHubアカウント：Tomohiro Nagahori</li>
            </ol>
            <button class="sidebar-link"><a href="https://slack-clone-app-3f955.web.app/">もう一つの作品はこちら</a></button>
        </div>

    </div>
    <div v-if="isAuthenticated && modalVisible" class="modal">
        <div class="actions mt-4 flex justify-between px-8">
            <div class="back-btn vertical-middle" @click="modalVisible = false">
                <img src="/images/back.svg" class="h-4">
            </div>
            <div class="post-btn" @click="post">
                upload
            </div>
        </div>
        <div class="moda_content p-8">
            <div class="flex justify-center">
                <img :src="imageUrl" class="uploaded-image">
            </div>
            <el-upload
                v-if="!imageUrl"
                action=""
                :show-file-list="false"
                :http-request="uploadFile"
                >
                <el-button size="small" type="primary">ライブラリ</el-button>
            </el-upload>
            <el-input 
                type="textarea"
                :rows="8"
                placeholder="Text"
                class="mt-8"
                v-model="text"
            >
            </el-input>
        </div>
    </div>
    <div v-else-if="!isAuthenticated && modalVisible" class="modal">
        <div class="actions mt-4 flex justify-between px-8">
            <div class="back-btn vertical-middle" @click="modalVisible = false">
                <img src="/images/back.svg" class="h-4">
            </div>
        </div>
        <div class="modal_content p-8 w-full h-full relative">
            <div class="flex justify-center">
                <img src="/images/logo.png" class="w-32 my-32">
            </div>
            <el-button size="small" type="primary" @click="login">Login</el-button>
        </div>
    </div>
    
</div>
</template>

<script>
import Post from '~/components/Post.vue'
import { db, firebase } from '~/plugins/firebase'
import { mapActions } from 'vuex'

export default {
    components: {
        Post
    },
    data(){
        return{
            posts:[],
            imageUrl: null,
            text: null,
            modalVisible: false,
        }
    },
    computed: {
        currentUser () {
            return this.$store.state.user
        },
         isAuthenticated () {
             return this.$store.getters.isAuthenticated
         }
    },
    mounted () {
        if (this.currentUser) {
            this.watchPostsChange()
        }
    },
    watch: {
        currentUser (user) {
            if (user) {
                this.watchPostsChange()
            }
        }
    },
    methods: {
        ...mapActions(['setUser']),
        login () {
            const provider =new firebase.auth.GoogleAuthProvider()
            firebase.auth().signInWithPopup(provider)
              .then((result) => {
                  this.setUser(result.user)
              }).catch((error) => {
                  window.alert(error)
              })
        },
        async post () {
            await db.collection('posts').add({
                text: this.text,
                image: this.imageUrl,
                createdAt: new Date().getTime(),
                userId: this.currentUser.uid
            })
            this.modalVisible = false
            this.text = null
            this.imageUrl = null
            window.alert('保存されたよ！')
        },
        openModal () {
            this.modalVisible = true
        },
        async uploadFile (data) {
            const storageRef = firebase.storage().ref()
            const time = new Date().getTime()
            const ref = storageRef.child(`posts/${time}_${data.file.name}`)
            const snapshot = await ref.put(data.file)
            const url = await snapshot.ref.getDownloadURL()
            this.imageUrl = url
        },
        async watchPostsChange () {
            const snapshot = await db.collection('users').doc(this.currentUser.uid).collection('followings').get()
            const followings = [this.currentUser.uid]
            snapshot.forEach((doc) => {
                followings.push(doc.id)
            })

            db.collection('posts').where('userId', 'in', followings).orderBy('createdAt').onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) =>{
                    const doc = change.doc
                    if (change.type === 'added') {
                        this.posts.unshift({ id: doc.id,...doc.data() })
                    }
            })
        })
        }
    },
}
</script>

<style scoped>


.post-btn {
    color: black;
    cursor: pointer;
}

.main-container{
    max-width: 934px;
    margin: 0 auto;
}

img{
    max-width: 100%;
    height: auto;
}

.sidebar{
    width: 400px;
    height: 800px;
    position: fixed;
    right: 50px;
    top: 50px;
    background-color: rgb(234, 235, 224);
}

.sidebar-icon {
    width: 70%;
    height: 35%;
    border-radius: 180px;
    position: relative;
    top: 45px;
    margin: 0 auto;
}

.sidebar-text {
    font-size: 8px;
    padding: 100px 60px;
    position: relative;
    bottom: 20px;
    text-align: center;
}
.sidebar-link {
    border-radius: 5px;
    background-color: blueviolet;
    font-size: 15px;
    color: orange;
    box-shadow: 0 5px rgb(81, 12, 145);
    cursor: pointer;
}

.sidebar-link:active {
    box-shadow: none;
    position: relative;
    top: 5px;

}

</style>