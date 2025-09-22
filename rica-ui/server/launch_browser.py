#!/usr/bin/env python3
import asyncio
import json
import argparse
import os
import pyotp
from datetime import datetime
from playwright.async_api import async_playwright
from camoufox import Camoufox
from social_automation import SocialAutomation

async def handle_social_login(page, account):
    platform = account.get('platform')
    username = account.get('username')
    password = account.get('password')
    two_factor_secret = account.get('twoFactorSecret')

    if not all([platform, username, password]):
        return False

    try:
        if platform == 'facebook':
            await page.fill('#email', username)
            await page.fill('#pass', password)
            await page.click('[name="login"]')
        elif platform == 'twitter':
            await page.fill('input[autocomplete="username"]', username)
            await page.click('text=Next')
            await page.fill('input[name="password"]', password)
            await page.click('text=Log in')
        elif platform == 'instagram':
            await page.fill('input[name="username"]', username)
            await page.fill('input[name="password"]', password)
            await page.click('button[type="submit"]')
        elif platform == 'linkedin':
            await page.fill('#username', username)
            await page.fill('#password', password)
            await page.click('button[type="submit"]')
        elif platform == 'tiktok':
            await page.click('text=Log in')
            await page.fill('input[name="username"]', username)
            await page.fill('input[name="password"]', password)
            await page.click('button[type="submit"]')
        elif platform == 'pinterest':
            await page.click('text=Log in')
            await page.fill('input[type="email"]', username)
            await page.fill('input[type="password"]', password)
            await page.click('button[type="submit"]')

        # Handle 2FA if configured
        if two_factor_secret:
            # Wait for 2FA input field
            two_fa_selector = 'input[name="authenticator-code"], input[name="otpCode"]'
            await page.wait_for_selector(two_fa_selector, timeout=5000)
            
            # Generate 2FA code
            totp = pyotp.TOTP(two_factor_secret)
            code = totp.now()
            
            # Enter 2FA code
            await page.fill(two_fa_selector, code)
            await page.keyboard.press('Enter')

        return True
    except Exception as e:
        print(f"Error during {platform} login: {str(e)}")
        return False

async def launch_browser(config, profile_id):
    try:
        # Initialize CamouFox with the provided configuration
        async with Camoufox(config=config) as browser:
            # Create a new page
            page = await browser.new_page()
            
            # Get the start URL and social accounts
            start_url = config.get('startUrl', 'about:blank')
            social_accounts = config.get('socialAccounts', [])
            automation_tasks = config.get('automationTasks', [])
            
            # Navigate to the start URL
            await page.goto(start_url)
            
            # Handle auto-login if configured
            if social_accounts and social_accounts[0].get('autoLogin'):
                success = await handle_social_login(page, social_accounts[0])
                
                if success and automation_tasks:
                    # Initialize automation for the platform
                    automation = SocialAutomation(page, social_accounts[0]['platform'])
                    
                    # Execute automation tasks
                    for task in automation_tasks:
                        action = task.get('action')
                        params = task.get('params', {})
                        
                        if action == 'schedule':
                            # Handle scheduled posts
                            schedule_time = datetime.fromisoformat(params['schedule_time'])
                            if schedule_time > datetime.now():
                                await automation.schedule_post(
                                    content=params['content'],
                                    schedule_time=schedule_time,
                                    media=params.get('media')
                                )
                        else:
                            # Execute immediate actions
                            await automation.execute_action(action, params)
                        
                        # Add delay between actions
                        await asyncio.sleep(random.uniform(2, 5))
                    
                    # Collect analytics after automation
                    analytics = await automation.collect_analytics()
                    
                    # Save analytics to file
                    with open(f'analytics_{profile_id}.json', 'a') as f:
                        json.dump(analytics, f)
                        f.write('\n')
            
            # Keep the browser open until manually closed
            while True:
                await asyncio.sleep(1)
                
    except Exception as e:
        print(f"Error launching browser: {str(e)}")
        return 1

def main():
    parser = argparse.ArgumentParser(description='Launch CamouFox browser with profile')
    parser.add_argument('--config', type=str, required=True, help='Browser configuration JSON')
    parser.add_argument('--profile-id', type=str, required=True, help='Profile ID')
    
    args = parser.parse_args()
    
    try:
        config = json.loads(args.config)
        asyncio.run(launch_browser(config, args.profile_id))
    except Exception as e:
        print(f"Failed to launch browser: {str(e)}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
