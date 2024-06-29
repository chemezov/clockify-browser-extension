clockifyButton.render(
	'.sideBySideHeader:not(.clockify)',
	{ observe: true },
	(itemHeader) => {
		const titleSelector = '.sideBySideHeader__title';
		const tagsSelector = '.badgeList__item';

		const itemTitle = () => text(titleSelector, itemHeader);
		const itemId = () => {
			let hash = document.location.hash;
			const regex = /(\d+)$/;

			if (hash.startsWith('#id') || hash.startsWith('#list')) {
				const match = hash.match(regex);

				if (match && match[0]) {
					return match[0];
				}
			}
		}

		const description = () => itemTitle();
		const projectNameFallback = () => {
			let title = itemTitle();

			const regex = /\[(.*?)\]/;
			const match = title.match(regex);

			if (match && match[1]) {
				return match[1];
			}

			return null;
		}
		const projectName = () => {
			let tags = tagNames();

			for (let tag of tags) {
				if (tag.startsWith('[') && tag.endsWith(']')) {
					return tag.slice(1, -1);
				}
			}

			return projectNameFallback();
		}

		const taskName = () => itemTitle();
		const tagNames = () => textList(tagsSelector, itemHeader);

		const entry = { description, projectName, taskName, tagNames };

		const link = clockifyButton.createButton(entry);

		const container = createTag('div', 'clockify-widget-container');

		container.append(link);

		$('.sideBySideHeader__bottom', itemHeader).append(container);
	}
);

applyStyles(`
	.clockify-widget-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		padding: 5px 0;
	}
`);

/**
 * SITIS: custom fields
 */

// Функция для установки значения и генерации событий
function setInputValue(element, value) {
	// Устанавливаем значение
	element.value = value;

	// Создаем и отправляем событие input
	const inputEvent = new Event('input', { bubbles: true });
	element.dispatchEvent(inputEvent);

	// Создаем и отправляем событие change
	const changeEvent = new Event('change', { bubbles: true });
	element.dispatchEvent(changeEvent);
}

// Функция, которая будет вызываться, когда элемент появится на странице
function handleElementAppearance(element) {
	const taskId = () => {
		let hash = document.location.hash;
		const regex = /(\d+)$/;

		if (hash.startsWith('#id') || hash.startsWith('#list')) {
			const match = hash.match(regex);

			if (match && match[0]) {
				return match[0];
			}
		}
	}

	setTimeout(() => {
		let el = $('.clockify-integration-popup .custom-field input');
		let value = 'https://pyrus.com/t#id' + taskId();

		setInputValue(el, value + ' ');
	}, 200);
}

// Функция для создания и настройки MutationObserver
function observeElement(selector, callback) {
	// Создаем новый MutationObserver
	const observer = new MutationObserver((mutationsList, observer) => {
		for (let mutation of mutationsList) {
			// Проверяем добавленные узлы
			for (let addedNode of mutation.addedNodes) {
				// Проверяем, является ли добавленный узел нужным элементом или содержит его
				if (addedNode.matches && addedNode.matches(selector)) {
					callback && callback(addedNode);
					// observer.disconnect(); // Останавливаем наблюдение, если элемент найден
					return;
				} else if (addedNode.querySelector && addedNode.querySelector(selector)) {
					callback && callback(addedNode.querySelector(selector));
					// observer.disconnect(); // Останавливаем наблюдение, если элемент найден
					return;
				}
			}
		}
	});

	// Начинаем наблюдение за изменениями в document.body
	observer.observe(document.body, { childList: true, subtree: true });
}

// Используем функцию observeElement с нужным селектором
observeElement('.clockify-integration-popup .custom-field input', handleElementAppearance);
