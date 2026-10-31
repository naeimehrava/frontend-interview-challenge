<template>
	<v-dialog
		width="600"
		:model-value="props.modelValue"
		@update:model-value="$emit('update:model-value', true)"
	>
		<v-card class="pa-8">
			<div class="d-flex justify-space-between align-center mb-8">
				<h3>Email</h3>
				<DynamicIcon icon-name="close" size="24px" @click="$emit('update:model-value', false)" />
			</div>
			<p v-for="user in props.users" :key="user.id" class="mb-1">
				{{user.email}}
			</p>
		</v-card>
	</v-dialog>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
	modelValue: boolean,
	users: Record<string, any>[]
}>(), {
	users: []
})
</script>

<style scoped>
h3{
	font-size: 2rem;
}
</style>
