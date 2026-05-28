Before making any changes, you must:

1. Read and understand the full contents of this file.
2. Explore the project folder structure and read key files (entry points, configs, schema, etc.).
3. Ask one clarifying question if anything is ambiguous — do not assume.
4. Follow all rules in Section 4 without exception.
5. Do not generate code, modify files, or suggest refactors until you have done steps 1–3.

Bugs to Fix & Features to Implement

1. In the events dashboard page:

- in the events dashboard page, the "+ Add New Event" button is too big, the can you adjust the spacing a little bit.
- make the 'placeholder' for the event images a little bit bigger.
- position the event location and event category slightly higher, just below the event name.
- after clicking the "View" button, in the src\app\events\[id]\page.tsx, add a "Join Event" button. Also add a placeholder for the event image.
- whenever logged in, can you align the avatar icon in the navbar section.

2. User Authentication:

- Let's change the logic here, there should be three types of user: Admin, Organizer, and Student.

admin approves organizer requests. The flow would be: user signs up as student, requests organizer access, admin approves. No shared keys to manage.

| Action | Student | Organizer | Admin |
| ------ | ------- | --------- | ----- |
| Join events | yes | yes | yes |
| Create events | no | yes | yes |
| Manage own events | no | yes | yes |
| Manage all events | no | no | yes |
| Approve organizers | no | no | yes |

- When users logged in with GitHub, it won't display in the supabase, i tried it myself

- so as much as possible, make some changes in the database, login & signup form

Rules & Constraints

These are non-negotiable. Follow them exactly.

Commit Format


[branch][Action] Brief description

Actions: Added / Updated / Removed / Fixed / Refactored / Chore
Example: [main] Fixed form validation on event creation page


What NOT to Touch

Files, folders, or logic that should not be modified unless explicitly told to.
