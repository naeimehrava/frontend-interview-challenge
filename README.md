# Interview Challenge
Please read and complete the following tasks. Feel free to use Vuetify components, utilities and config file.

## 1- Icon lazy loading
Please use lazy loading instead of eager loading inside `components/DynamicIcon.vue`.
**Bonus**: cache the icons that are already loaded once.

## 2- Icon Colors
make svg icon colors dynamic. Icons can be found inside `@\assets\icons`

## 3- Discovering issues
fix all problems and bad patterns you can find on `pages/index.vue`. Improve performance and responsivity too.
**Important Hint:** Use the best approach even if the bad code pattern does not cause any bug.

## 4- Reactivity
Scenario: Imagine you are building a personalized dashboard for a web application. Users can customize their preferences, and these settings should be persisted across page reloads using localStorage.

Users can set:
- theme ("light" or "dark")
- fontSize ("small", "medium", "large")

If a user changes their theme or font size, the changes should be automatically saved in localStorage.
When the page reloads, their last chosen settings should be restored.

Provide buttons for the user to switch the theme and adjust the font size.