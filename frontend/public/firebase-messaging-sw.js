if ('function' === typeof importScripts) {
	importScripts('https://www.gstatic.com/firebasejs/9.6.9/firebase-app-compat.js');
	importScripts('https://www.gstatic.com/firebasejs/9.6.9/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
	const config = {
		apiKey: 'AIzaSyAHLRt_Ux3BQaQaphnGCjYI6omXYjhyFXk',
		authDomain: 'sherpherd-v2.firebaseapp.com',
		projectId: 'sherpherd-v2',
		storageBucket: 'sherpherd-v2.appspot.com',
		messagingSenderId: '833415664342',
		appId: '1:833415664342:web:56548224bda47a21162f77',
		measurementId: 'G-2HH78LJKZ7'
	}

	firebase.initializeApp(config);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
	const messaging = firebase.messaging();

	messaging.onBackgroundMessage((payload) => {
		// console.log('[firebase-messaging-sw.js] Received background message ', payload);
		// Customize notification here
		const notificationsData = payload?.notification;
		const title = notificationsData.title;
		const options = {
			body: notificationsData.body
		}
		return self.registration.showNotification(title, options);
	});
}
