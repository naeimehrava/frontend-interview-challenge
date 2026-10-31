<template>
	<v-card flat class=mb-12>
		<v-card-title class="d-flex justify-space-between align-center">
			<span class="text-blue-grey-darken-4" style="width: 100%;">List of All users ({{usersCount}})</span>
			<div>
				<v-btn
					color="primary"
					class="ms-2"
					variant="outlined"
					:disabled="isFetching"
					@click="areEmailsVisible = true"
				>
					<DynamicIcon icon-name="users" size="24px" />
					<span class="ms-2">User Emails</span>
				</v-btn>
				<v-btn
					color="primary"
					class="ms-2"
					:loading="isFetching"
					:disabled="isFetching"
					@click="fetchData()"
				>
					<DynamicIcon icon-name="refresh" size="24px" />
					<span class="ms-2">Refresh Users</span>
				</v-btn>
			</div>
		</v-card-title>

		<v-alert
			v-if="fetchError && !isFetching"
			type="error"
			variant="tonal"
			density="compact"
			class="mx-4 mb-4"
		>
			{{ fetchError }}
		</v-alert>

		<v-skeleton-loader v-if="isFetching" v-for="i in 10" type="list-item" />
		<v-list v-else v-for="(user, userIndex) in users" :key="userIndex">
			<v-list-item>
				{{userIndex}}- {{user.name}}
			</v-list-item>
		</v-list>
	</v-card>

	<v-card flat>
		<div class="pricing-container">
			<h3>Pricing</h3>
			<div class="card">
				<h3>Starter</h3>
				<div class="price">$19/mo</div>
				<p>Perfect for freelancers and side projects needing essential features.</p>
				<v-btn>Get Started</v-btn>
			</div>
			<div class="card featured">
				<h3>Pro</h3>
				<div class="price">$49/mo</div>
				<p>Ideal for growing teams requiring advanced analytics and priority support.</p>
				<v-btn>Get Started</v-btn>
			</div>
			<div class="card">
				<h3>Enterprise</h3>
				<div class="price">$99/mo</div>
				<p>Custom solutions with dedicated support and unlimited scale.</p>
				<v-btn>Get Started</v-btn>
			</div>
		</div>
	</v-card>
	<UserEmails v-model="areEmailsVisible" :users="users" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import UserEmails from '@/components/EmailsDialog.vue';

const areEmailsVisible = ref(false);
const users = ref<Record<string, any>[]>([])
const usersCount = ref(0);
const isFetching = ref<boolean>(true);
const fetchError = ref<string | null>(null);

let latestFetchId = 0;
let activeAbortController: AbortController | null = null;

watch(users, () => {
	usersCount.value = users.value.length;
})

function delayWithAbort(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException('Request aborted', 'AbortError'));
			return;
		}

		const onAbort = () => {
			clearTimeout(timerId);
			reject(new DOMException('Request aborted', 'AbortError'));
		};

		const timerId = setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			resolve();
		}, ms);

		signal.addEventListener('abort', onAbort, { once: true });
	});
}

async function fetchData(){
	const fetchId = ++latestFetchId;
	activeAbortController?.abort();
	const controller = new AbortController();
	activeAbortController = controller;

	isFetching.value = true;
	fetchError.value = null;

	try {
		const response = await fetch('https://jsonplaceholder.typicode.com/users', {
			signal: controller.signal,
		});
		if (!response.ok) throw new Error(`Failed to fetch (${response.status})`);
		await delayWithAbort(1000, controller.signal);
		const data = await response.json();
		if (fetchId !== latestFetchId) return;
		users.value = data.sort(() => Math.random() - 0.5);
	} catch (error) {
		if (controller.signal.aborted || fetchId !== latestFetchId) {
			return;
		}
		fetchError.value = error instanceof Error ? error.message : 'Failed to fetch';
		console.error(error);
	} finally {
		if (fetchId === latestFetchId) {
			isFetching.value = false;
			activeAbortController = null;
		}
	}
}

onMounted(() => {
	fetchData()
})

onBeforeUnmount(() => {
	latestFetchId++;
	activeAbortController?.abort();
})
</script>

<style>
/* Container */
.pricing-container {
	width: 1200px;
	height: 500px;
	padding: 40px;
}

/* Individual Card */
.card {
	float: left;
	width: 350px;
	height: 400px;
	margin-right: 30px;
	padding: 24px;
	border-radius: 8px;
}

.price {
	font-size: 36px;
	font-weight: bold;
}
</style>
