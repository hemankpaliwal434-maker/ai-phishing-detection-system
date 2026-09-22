import random
from typing import List, Tuple
from app.services.feature_extractor import extract_feature_vector, FEATURE_NAMES

LEGITIMATE_URLS = [
    "https://www.google.com/search?q=cybersecurity+research",
    "https://github.com/torvalds/linux",
    "https://en.wikipedia.org/wiki/Phishing",
    "https://aws.amazon.com/solutions/case-studies/",
    "https://learn.microsoft.com/en-us/azure/security/",
    "https://appleid.apple.com/",
    "https://www.netflix.com/browse",
    "https://stackoverflow.com/questions/tagged/python",
    "https://www.nytimes.com/section/technology",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    "https://www.reddit.com/r/netsec/",
    "https://docs.python.org/3/library/urllib.parse.html",
    "https://www.chase.com/personal/banking",
    "https://www.bankofamerica.com/online-banking/",
    "https://www.paypal.com/us/home",
    "https://www.binance.com/en",
    "https://store.steampowered.com/app/730/CounterStrike_2/",
    "https://www.coursera.org/specializations/cyber-security",
    "https://news.ycombinator.com/news",
    "https://www.mit.edu/research/",
    "https://www.stanford.edu/academics/",
    "https://www.gov.uk/browse/business",
    "https://www.cdc.gov/flu/about/index.html",
    "https://www.spotify.com/us/premium/",
    "https://zoom.us/pricing",
    "https://slack.com/enterprise",
    "https://www.dropbox.com/business",
    "https://medium.com/topic/cybersecurity",
    "https://www.cloudflare.com/learning/security/what-is-phishing/",
    "https://www.khanacademy.org/computing/computer-science",
    "https://gitlab.com/explore",
    "https://bitbucket.org/product",
    "https://www.adobe.com/creativecloud.html",
    "https://www.oracle.com/cloud/",
    "https://www.salesforce.com/products/crm/",
    "https://www.linkedin.com/feed/",
    "https://twitter.com/explore",
    "https://www.youtube.com/feed/trending",
    "https://www.twitch.tv/directory",
    "https://www.bbc.com/news/technology"
]

PHISHING_URLS = [
    "http://192.168.1.105/paypal/signin/verification.php?cmd=_login-run",
    "http://secure-paypal-login-account-update.xyz/webscr?cmd=login_submit",
    "https://chase-bank-verify-ident-security-update.com/login.html",
    "http://paypa1-account-alert-suspended.com/verification?token=8923749823",
    "http://microsoft-online-portal-365-auth.top/security/login.asp",
    "http://apple-id-verify-manage-account.icu/auth?id=983149814",
    "http://bankofamerica.com-secure-login-session.site/ebanking/",
    "http://google-drive-shared-doc-view-secure.online/auth/login",
    "http://netflix-billing-subscription-failed-update.work/renew",
    "http://binance-kyc-verification-security-alert.xyz/wallet/auth",
    "http://meta-mask-seed-recovery-wallet-sync.club/import-phrase",
    "http://wellsfargo-online-banking-security-access.buzz/login.php",
    "http://amazon-account-suspension-alert-action.shop/verify?session=2",
    "http://instagram-copyright-infringement-appeal.xyz/login.html",
    "http://104.28.19.42/secure/banking/auth.php?target=wells",
    "http://login.google.com.account-security-check.xyz/servicelogin",
    "http://steam-community-free-nitro-gifts-trade.top/tradeoffer/9823",
    "http://dhl-express-package-delivery-tracking-fee.online/pay?id=3847",
    "http://irs-tax-refund-direct-deposit-claim.xyz/form8821.php",
    "http://coinbase-two-factor-security-reactivation.click/login",
    "http://dropbox-secure-file-access-recipient-login.site/share",
    "http://citibank-card-activation-pin-reset.xyz/secure/pin",
    "http://spotify-free-lifetime-premium-redeem.top/voucher",
    "http://adobe-pdf-cloud-reader-secure-verify.work/document_download",
    "http://pаypal.com/security/login.html",  # Homoglyph Cyrillic 'а'
    "http://g00gle.com/auth/login?continue=drive",
    "http://secure.login.bank.update.account.verify.alert.chase-online.xyz/auth",
    "http://auth-office365-microsoft-sso-portal.site/adfs/ls/",
    "http://whatsapp-web-desktop-sync-qr-code.top/session?qr=scan",
    "http://telegram-premium-gift-bot-claim.online/free-bot"
]


def generate_synthetic_samples(num_samples_each: int = 500) -> Tuple[List[str], List[int]]:
    """
    Generate synthetic dataset of legitimate and phishing URLs covering various threat tactics.
    Returns: (urls, labels) where 0 = Legitimate/Safe, 1 = Phishing
    """
    urls = []
    labels = []

    legit_domains = [
        "google.com", "github.com", "microsoft.com", "amazon.com", "apple.com",
        "wikipedia.org", "netflix.com", "stackoverflow.com", "medium.com", "reddit.com",
        "nytimes.com", "linkedin.com", "spotify.com", "dropbox.com", "slack.com",
        "cloudflare.com", "mozilla.org", "adobe.com", "salesforce.com", "zoom.us",
        "harvard.edu", "mit.edu", "stanford.edu", "nih.gov", "nasa.gov"
    ]

    legit_paths = [
        "", "about", "products", "contact-us", "docs/api", "help/articles/1029",
        "features/enterprise", "blog/2026/cybersecurity-updates", "solutions",
        "resources/whitepapers", "downloads/client", "community/forum"
    ]

    # Generate legitimate samples
    for url in LEGITIMATE_URLS:
        urls.append(url)
        labels.append(0)

    for _ in range(num_samples_each):
        domain = random.choice(legit_domains)
        path = random.choice(legit_paths)
        sub = random.choice(["", "www.", "blog.", "docs.", "dev.", "api.", "help."])
        protocol = "https://" if random.random() > 0.05 else "http://"
        query = ""
        if random.random() > 0.6:
            query = f"?ref={random.randint(100, 999)}&page={random.randint(1, 10)}"
        
        url = f"{protocol}{sub}{domain}/{path}{query}"
        urls.append(url)
        labels.append(0)

    # Generate phishing samples
    for url in PHISHING_URLS:
        urls.append(url)
        labels.append(1)

    phish_brands = ["paypal", "chase", "bankofamerica", "netflix", "microsoft", "google", "apple", "binance", "metamask", "amazon", "wellsfargo", "coinbase"]
    phish_actions = ["login", "verify", "secure", "update-account", "session-expired", "kyc-verify", "recover-wallet", "confirm-identity", "billing-error", "unlock-access"]
    phish_tlds = ["xyz", "top", "icu", "online", "site", "work", "buzz", "club", "click", "shop"]

    for _ in range(num_samples_each):
        brand = random.choice(phish_brands)
        action = random.choice(phish_actions)
        tld = random.choice(phish_tlds)
        attack_type = random.choice(["subdomain", "typo", "ip", "deep_sub", "hyphen_brand", "fake_tld"])

        protocol = "http://" if random.random() > 0.3 else "https://"

        if attack_type == "subdomain":
            url = f"{protocol}{brand}.com.{action}-{random.randint(10,99)}.{tld}/auth/index.php?token={random.randint(100000, 999999)}"
        elif attack_type == "typo":
            typo_brand = brand.replace('o', '0').replace('l', '1').replace('e', '3').replace('a', '4')
            url = f"{protocol}{typo_brand}-{action}.{tld}/signin?cmd=login"
        elif attack_type == "ip":
            ip_str = f"{random.randint(45, 195)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            url = f"http://{ip_str}/{brand}/login.php?session_id={random.randint(10000, 99999)}"
        elif attack_type == "deep_sub":
            url = f"{protocol}secure.login.portal.{brand}.alert.{tld}/verify.html"
        elif attack_type == "hyphen_brand":
            url = f"{protocol}{brand}-{action}-security-center.{tld}/index.php?id={random.randint(1000, 9999)}"
        else:
            url = f"{protocol}{brand}.com-{action}-update.{tld}/banking/auth.aspx"

        urls.append(url)
        labels.append(1)

    return urls, labels
