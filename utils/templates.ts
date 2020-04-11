const head = `<mj-head><mj-font name="Sen" href="https://fonts.googleapis.com/css?family=Sen" /></mj-head>`;

export const getRequestAcceptedTemplate = (args: {
  requesterName: string;
  acceptorName: string;
  acceptorPhone: string;
}) => {
  return `
    <mjml>
        ${head}
        <mj-body>
            <mj-section>
                <mj-column>
                    <mj-image src="https://images.prismic.io/komak/96514f1a-2c09-42f5-b1b1-9d06bd7bf6e1_%28Put+Here%29+Cover+%26+Profile+photo+%281%29.png?auto=compress,format"></mj-image>
                    <mj-text font-size="16px" font-family="Sen" font-weight=400>Hey ${args.requesterName}</mj-text>
                    <mj-text font-size="16px" font-family="Sen" line-height="1.5" font-weight=400>${args.acceptorName} has agreed to help you out. Give them a call to let them know what you need help with. You can find their contact details below.</mj-text>
                    <mj-text font-size="16px" font-family="Sen" line-height="1.5" font-weight=400>Remember to follow our <a href="https://komak.io/user-instructions">user instructions</a> and avoid direct contact for everyone’s safety.</mj-text>
                    <mj-text font-size="16px" font-family="Sen"  line-height="0.5" font-weight=400>Name: ${args.requesterName}</mj-text>
                    <mj-text font-size="16px" font-family="Sen" line-height="0.5" font-weight=400>Phone number: ${args.acceptorPhone}</mj-text>
                    <mj-text font-size="16px" font-family="Sen" font-weight=400></mj-text>
                    <mj-text font-size="16px" font-family="Sen" line-height="0.3" font-weight=400>Have a great day,</mj-text>
                    <mj-text font-size="16px" font-family="Sen" line-height="0.1" font-weight=400>The Komak Team</mj-text>
                </mj-column>
            </mj-section>
        </mj-body>
    </mjml>`;
};
