<template>
  <div class="grid grid-cols-12 gap-4">
    <aside class="col-span-3">
      <RoomList />
    </aside>
    <section class="col-span-9">
      <div class="border rounded-2xl h-[70vh] flex flex-col">
        <ChatRoomHeader />
        <MessageList class="flex-1" />
        <MessageInput />
      </div>
    </section>
  </div>
</template>

<script setup>
// import RoomList from '../components/RoomList.vue'
// import ChatRoomHeader from '../components/ChatRoomHeader.vue'
// import MessageList from '../components/MessageList.vue'
// import MessageInput from '../components/MessageInput.vue'
</script>
