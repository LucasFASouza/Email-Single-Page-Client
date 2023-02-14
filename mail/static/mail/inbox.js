document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emailsContent = document.querySelector('#emails-view');
  emailsContent.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(email => {
            let div = document.createElement('div');
            div.className = email['read'] ? "email-list-item email-list-item-read" : "email-list-item email-list-item-unread";
            div.innerHTML = `
                <span> <b>${email['sender']}</b> </span>
                <span> ${email['subject']} </span>
                <span> ${email['timestamp']} </span>
            `;

            div.addEventListener('click', () => load_email(email['id']));
            emailsContent.appendChild(div);
        });
    });
}

function submit_email(event) {
  event.preventDefault()

  // Post email to API route
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => load_mailbox('sent'));
}

function load_email(id) {
    fetch('/emails/' + id)
      .then(response => response.json())
      .then(email => {
        // Show email and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#email-view').style.display = 'block';
        document.querySelector('#compose-view').style.display = 'none';

        const emailContent = document.querySelector('#email-view');
        emailContent.innerHTML = `
          <ul class="email-info">
            <li><b>From:</b> <span>${email['sender']}</span></li>
            <li><b>To: </b><span>${email['recipients']}</span></li>
            <li><b>Subject:</b> <span>${email['subject']}</span</li>
            <li><b>Time:</b> <span>${email['timestamp']}</span></li>
          </ul>
          <p>${email['body']}</p>
        `;

      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    });
}
