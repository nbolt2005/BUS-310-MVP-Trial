-- Expand analytics_events.event_type for MVP tracking (pay slider, newsletter, etc.)
alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'page_view',
      'trip_view',
      'share',
      'save',
      'cta_click',
      'newsletter_signup',
      'pay_slider_submit',
      'contact_submit',
      'paywall_prompt_shown',
      'paywall_response',
      'repeat_visit',
      'trip_share',
      'trip_save',
      'trip_unsave'
    )
  );
