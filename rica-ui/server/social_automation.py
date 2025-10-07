import asyncio
import json
import random
import pyotp
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class SocialAutomation:
    def __init__(self, page, platform: str):
        self.page = page
        self.platform = platform
        self.actions = {
            'facebook': {
                'post': self.facebook_post,
                'like': self.facebook_like,
                'comment': self.facebook_comment,
                'share': self.facebook_share,
                'follow': self.facebook_follow,
                'message': self.facebook_message
            },
            'twitter': {
                'post': self.twitter_post,
                'like': self.twitter_like,
                'retweet': self.twitter_retweet,
                'follow': self.twitter_follow,
                'message': self.twitter_message
            },
            'instagram': {
                'post': self.instagram_post,
                'like': self.instagram_like,
                'comment': self.instagram_comment,
                'follow': self.instagram_follow,
                'message': self.instagram_message
            },
            'linkedin': {
                'post': self.linkedin_post,
                'like': self.linkedin_like,
                'comment': self.linkedin_comment,
                'share': self.linkedin_share,
                'connect': self.linkedin_connect
            }
        }

    async def execute_action(self, action: str, params: Dict):
        platform_actions = self.actions.get(self.platform, {})
        action_func = platform_actions.get(action)
        
        if action_func:
            try:
                return await action_func(**params)
            except Exception as e:
                print(f"Error executing {action} on {self.platform}: {str(e)}")
                return False
        return False

    async def add_random_delay(self):
        """Add random delay to simulate human behavior"""
        delay = random.uniform(1, 3)
        await asyncio.sleep(delay)

    async def scroll_random(self):
        """Scroll randomly to simulate human behavior"""
        scroll_amount = random.randint(300, 700)
        await self.page.evaluate(f'window.scrollBy(0, {scroll_amount})')
        await self.add_random_delay()

    # Facebook Actions
    async def facebook_post(self, content: str, media: Optional[List[str]] = None):
        try:
            # Click create post button
            await self.page.click('[aria-label="Create post"]')
            await self.add_random_delay()
            
            # Type content
            await self.page.fill('[contenteditable="true"]', content)
            
            # Handle media uploads if present
            if media:
                for file in media:
                    await self.page.click('[aria-label="Photo/video"]')
                    await self.page.set_input_files('input[type="file"]', file)
            
            # Post
            await self.page.click('div[aria-label="Post"]')
            return True
        except Exception as e:
            print(f"Error posting to Facebook: {str(e)}")
            return False

    async def facebook_like(self, post_url: str):
        try:
            await self.page.goto(post_url)
            await self.add_random_delay()
            await self.page.click('[aria-label="Like"]')
            return True
        except Exception as e:
            print(f"Error liking Facebook post: {str(e)}")
            return False

    # Twitter Actions
    async def twitter_post(self, content: str, media: Optional[List[str]] = None):
        try:
            # Click tweet button
            await self.page.click('[data-testid="tweetTextarea_0"]')
            await self.add_random_delay()
            
            # Type content
            await self.page.fill('[data-testid="tweetTextarea_0"]', content)
            
            # Handle media uploads
            if media:
                for file in media:
                    await self.page.click('[data-testid="imageLoader"]')
                    await self.page.set_input_files('input[type="file"]', file)
            
            # Post tweet
            await self.page.click('[data-testid="tweetButton"]')
            return True
        except Exception as e:
            print(f"Error posting to Twitter: {str(e)}")
            return False

    # Instagram Actions
    async def instagram_post(self, content: str, media: List[str]):
        try:
            # Click new post button
            await self.page.click('[aria-label="New post"]')
            await self.add_random_delay()
            
            # Upload media
            await self.page.set_input_files('input[type="file"]', media[0])
            await self.add_random_delay()
            
            # Next
            await self.page.click('button:has-text("Next")')
            await self.add_random_delay()
            
            # Add caption
            await self.page.fill('textarea[aria-label="Write a caption..."]', content)
            
            # Share
            await self.page.click('button:has-text("Share")')
            return True
        except Exception as e:
            print(f"Error posting to Instagram: {str(e)}")
            return False

    # LinkedIn Actions
    async def linkedin_post(self, content: str, media: Optional[List[str]] = None):
        try:
            # Click post button
            await self.page.click('button:has-text("Start a post")')
            await self.add_random_delay()
            
            # Type content
            await self.page.fill('[contenteditable="true"]', content)
            
            # Handle media uploads
            if media:
                for file in media:
                    await self.page.click('button[aria-label="Add media"]')
                    await self.page.set_input_files('input[type="file"]', file)
            
            # Post
            await self.page.click('button:has-text("Post")')
            return True
        except Exception as e:
            print(f"Error posting to LinkedIn: {str(e)}")
            return False

    # Generic Actions
    async def collect_analytics(self) -> Dict:
        """Collect analytics data for the account"""
        analytics = {
            'timestamp': datetime.now().isoformat(),
            'followers': 0,
            'following': 0,
            'posts': 0,
            'engagement_rate': 0
        }
        
        try:
            if self.platform == 'instagram':
                # Get followers count
                followers_text = await self.page.text_content('a:-has-text("followers")')
                analytics['followers'] = int(''.join(filter(str.isdigit, followers_text)))
                
                # Get following count
                following_text = await self.page.text_content('a:-has-text("following")')
                analytics['following'] = int(''.join(filter(str.isdigit, following_text)))
                
                # Get posts count
                posts_text = await self.page.text_content('span:-has-text(" posts")')
                analytics['posts'] = int(''.join(filter(str.isdigit, posts_text)))
            
            elif self.platform == 'twitter':
                # Get followers count
                followers_text = await self.page.text_content('[data-testid="followersCount"]')
                analytics['followers'] = int(''.join(filter(str.isdigit, followers_text)))
                
                # Get following count
                following_text = await self.page.text_content('[data-testid="followingCount"]')
                analytics['following'] = int(''.join(filter(str.isdigit, following_text)))
                
                # Get tweets count
                tweets_text = await self.page.text_content('[data-testid="tweetsCount"]')
                analytics['posts'] = int(''.join(filter(str.isdigit, tweets_text)))
            
            # Calculate engagement rate (if possible)
            if analytics['followers'] > 0 and analytics['posts'] > 0:
                analytics['engagement_rate'] = await self.calculate_engagement_rate()
            
        except Exception as e:
            print(f"Error collecting analytics: {str(e)}")
        
        return analytics

    async def calculate_engagement_rate(self) -> float:
        """Calculate engagement rate based on recent posts"""
        try:
            total_engagement = 0
            post_count = 0
            
            # Scroll through recent posts
            for _ in range(3):
                await self.scroll_random()
            
            if self.platform == 'instagram':
                # Get likes and comments from recent posts
                posts = await self.page.query_selector_all('article')
                for post in posts[:10]:
                    likes = await post.query_selector('span:-has-text("likes")')
                    comments = await post.query_selector('span:-has-text("comments")')
                    
                    if likes and comments:
                        likes_count = int(''.join(filter(str.isdigit, await likes.text_content())))
                        comments_count = int(''.join(filter(str.isdigit, await comments.text_content())))
                        total_engagement += likes_count + comments_count
                        post_count += 1
            
            if post_count > 0:
                return (total_engagement / post_count) * 100
            return 0
            
        except Exception as e:
            print(f"Error calculating engagement rate: {str(e)}")
            return 0

    async def schedule_post(self, content: str, schedule_time: datetime, media: Optional[List[str]] = None):
        """Schedule a post for later"""
        try:
            # Store the scheduled post
            scheduled_post = {
                'platform': self.platform,
                'content': content,
                'media': media,
                'schedule_time': schedule_time.isoformat()
            }
            
            # Save to scheduled posts file
            with open('scheduled_posts.json', 'a') as f:
                json.dump(scheduled_post, f)
                f.write('\n')
            
            return True
        except Exception as e:
            print(f"Error scheduling post: {str(e)}")
            return False
